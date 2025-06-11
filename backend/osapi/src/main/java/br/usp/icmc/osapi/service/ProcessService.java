package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.ProcessMetricsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProcessService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessService.class);

    public ProcessMetricsResponse executeAndMeasure(String processType) throws IOException, InterruptedException {
        String executableName = processType.equals("cpu") ? "cpu_process" : "io_process";
        File executableFile = getFileFromResources(executableName);
        File inputFile = null;

        List<String> dockerCommand = new ArrayList<>();
        dockerCommand.add("docker");
        dockerCommand.add("run");
        dockerCommand.add("--rm");
        dockerCommand.add("--cpus=0.5");
        dockerCommand.add("--memory=256m");
        dockerCommand.add("--cap-drop=ALL");
        dockerCommand.add("-v");
        dockerCommand.add(executableFile.getAbsolutePath() + ":/app/executable");
        dockerCommand.add("-w");
        dockerCommand.add("/app");

        if (processType.equals("io")) {
            inputFile = createDummyInputFile(executableFile.getParent());
            dockerCommand.add("-v");
            dockerCommand.add(inputFile.getAbsolutePath() + ":/app/input.txt:ro");
        }

        dockerCommand.add("c-compiler-image");
        dockerCommand.add("sh");
        dockerCommand.add("-c");
        // UPDATED COMMAND: Use 'time -v' for verbose output.
        dockerCommand.add("chmod +x ./executable && /usr/bin/time -v ./executable");

        try {
            logger.info("Executing command: {}", String.join(" ", dockerCommand));

            ProcessBuilder pb = new ProcessBuilder(dockerCommand);
            Process process = pb.start();

            String stdout = new BufferedReader(new InputStreamReader(process.getInputStream())).lines().reduce("", (a, b) -> a + b);
            String stderr = new BufferedReader(new InputStreamReader(process.getErrorStream())).lines().collect(Collectors.joining("\n"));

            if (!process.waitFor(20, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new InterruptedException("Process timed out");
            }

            logger.info("Process stdout: [{}]", stdout);
            logger.info("Process stderr (time command output): [{}]", stderr); // Changed to INFO level

            return parseVerboseTimeOutput(processType, stderr);

        } finally {
            executableFile.delete();
            if (inputFile != null) {
                inputFile.delete();
            }
        }
    }

    /**
     * NEW PARSING LOGIC for the multi-line output of 'time -v'.
     */
    private ProcessMetricsResponse parseVerboseTimeOutput(String processType, String verboseOutput) {
        String userTime = extractValue(verboseOutput, "User time \\(seconds\\)");
        String sysTime = extractValue(verboseOutput, "System time \\(seconds\\)");
        String realTime = extractValue(verboseOutput, "Elapsed \\(wall clock\\) time \\(h:mm:ss or m:ss\\)");
        String cpuPercentage = extractValue(verboseOutput, "Percent of CPU this job got").replace("%", ""); // Remove % sign
        String voluntarySwitches = extractValue(verboseOutput, "Voluntary context switches");
        String involuntarySwitches = extractValue(verboseOutput, "Involuntary context switches");

        if (processType.equals("cpu")) {
            return new ProcessMetricsResponse(
                    "cpu", realTime, userTime, sysTime,
                    cpuPercentage, voluntarySwitches, involuntarySwitches,
                    "A high 'Percent of CPU' and a high number of 'Involuntary context switches' (the OS forcing the process to yield the CPU) are characteristic of a CPU-bound process.\n" +
                            "The CPU-bound process spent most of its time in 'user' mode (userTime), performing calculations. The high 'user' time compared to 'real' time indicates high CPU saturation.",
                    List.of(85.0, 93.0, 95.0, 92.0, 96.0, 94.0, 95.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s")
            );
        } else { // io
            return new ProcessMetricsResponse(
                    "io", realTime, userTime, sysTime,
                    cpuPercentage, voluntarySwitches, involuntarySwitches,
                    "A low 'Percent of CPU' and a high number of 'Voluntary context switches' (the process giving up the CPU to wait for I/O) are characteristic of an I/O-bound process.\n" +
                            "The I/O-bound process has a large 'real' time but very low 'user' and 'sys' time. This means the process spent most of its time waiting for I/O operations (like reading/writing files), not using the CPU.",
                    List.of(5.0, 15.0, 4.0, 12.0, 6.0, 14.0, 5.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s")
            );
        }
    }

    /**
     * A helper method to extract a value from a specific line in the verbose output.
     * @param output The full multi-line output from 'time -v'.
     * @param key The text label for the value to find (regex-escaped).
     * @return The extracted value as a String, or "N/A".
     */
    private String extractValue(String output, String key) {
        // Example line: "User time (seconds): 0.28"
        // The regex looks for the key, followed by a colon, whitespace, and captures the value.
        Pattern pattern = Pattern.compile(key + ":\\s+([\\w:%.-]+)");
        Matcher matcher = pattern.matcher(output);
        return matcher.find() ? matcher.group(1) : "N/A";
    }

    // --- Helper methods getFileFromResources and createDummyInputFile remain the same ---

    private File getFileFromResources(String fileName) throws IOException {
        ClassPathResource resource = new ClassPathResource("executables/" + fileName);
        InputStream inputStream = resource.getInputStream();
        Path tempFile = Files.createTempFile(fileName, "");
        FileCopyUtils.copy(inputStream, Files.newOutputStream(tempFile));
        return tempFile.toFile();
    }

    private File createDummyInputFile(String directory) throws IOException {
        File inputFile = new File(directory, "input.txt");
        try (FileWriter writer = new FileWriter(inputFile)) {
            writer.write("This is a dummy file for the I/O-bound process to read and write. ".repeat(10000));
        }
        return inputFile;
    }
}