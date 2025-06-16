package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.ProcessMetricsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
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
        String sourceFileName = processType.equals("cpu") ? "cpu-bound.c" : "io-bound.c";
        String cCode = loadCSourceFromResources(sourceFileName);

        // --- START OF FIX ---
        // Simplified the internal command to remove the braces, which can sometimes cause issues.
        String dockerInternalCommand = "gcc -o app.out -x c -lm - && /usr/bin/time -v ./app.out 2>&1";
        // --- END OF FIX ---

        List<String> dockerCommand = new ArrayList<>(List.of(
                "docker", "run", "--rm", "-i", // Run in interactive mode for stdin
                "--cpus=0.96", "--memory=256m", "--cap-drop=ALL",
                "-w", "/app"
        ));

        // For the I/O process, we still need to create and mount a dummy input file.
        File inputFile = null;
        File tempDir = null;
        if (processType.equals("io")) {
            tempDir = Files.createTempFile("io-dir", "").toFile();
            tempDir.delete();
            tempDir.mkdir();
            inputFile = createDummyInputFile(tempDir.getAbsolutePath());
            dockerCommand.add("-v");
            dockerCommand.add(inputFile.getAbsolutePath() + ":/app/input.txt:ro");
        }

        dockerCommand.addAll(List.of(
                "c-compiler-image",
                "sh", "-c", dockerInternalCommand
        ));

        try {
            logger.info("--- Starting Final On-the-Fly Execution ---");
            logger.info("Executing command: {}", String.join(" ", dockerCommand));

            ProcessBuilder pb = new ProcessBuilder(dockerCommand);
            Process process = pb.start();

            try (OutputStreamWriter writer = new OutputStreamWriter(process.getOutputStream())) {
                writer.write(cCode);
            }

            String combinedOutput = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines().collect(Collectors.joining("\n"));

            if (!process.waitFor(30, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new InterruptedException("Process timed out");
            }

            logger.info("Final Combined Output: [{}]", combinedOutput);

            return parseVerboseTimeOutput(processType, combinedOutput);

        } finally {
            if (inputFile != null) inputFile.delete();
            if (tempDir != null) tempDir.delete();
        }
    }

    private String loadCSourceFromResources(String fileName) throws IOException {
        ClassPathResource resource = new ClassPathResource("c_source/" + fileName);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    // This DTO and parsing logic now only needs the output string
    private ProcessMetricsResponse parseVerboseTimeOutput(String processType, String verboseOutput) {
        String userTime = extractValue(verboseOutput, "User time \\(seconds\\)");
        String sysTime = extractValue(verboseOutput, "System time \\(seconds\\)");
        String realTime = extractValue(verboseOutput, "Elapsed \\(wall clock\\) time \\(h:mm:ss or m:ss\\)");
        String cpuPercentage = extractValue(verboseOutput, "Percent of CPU this job got").replace("%", "");
        String voluntarySwitches = extractValue(verboseOutput, "Voluntary context switches");
        String involuntarySwitches = extractValue(verboseOutput, "Involuntary context switches");

        if (processType.equals("cpu")) {
            return new ProcessMetricsResponse("cpu", realTime, userTime, sysTime, cpuPercentage, voluntarySwitches, involuntarySwitches,
                    "A high 'Percent of CPU' and a high number of 'Involuntary context switches' (the OS forcing the process to yield the CPU) are characteristic of a CPU-bound process.",
                    List.of(85.0, 93.0, 95.0, 92.0, 96.0, 94.0, 95.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s"));
        } else {
            return new ProcessMetricsResponse("io", realTime, userTime, sysTime, cpuPercentage, voluntarySwitches, involuntarySwitches,
                    "A low 'Percent of CPU' and a high number of 'Voluntary context switches' (the process giving up the CPU to wait for I/O) are characteristic of an I/O-bound process.",
                    List.of(5.0, 15.0, 4.0, 12.0, 6.0, 14.0, 5.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s"));
        }
    }

    // Helper methods extractValue and createDummyInputFile remain the same...
    private String extractValue(String output, String key) {
        Pattern pattern = Pattern.compile(key + ":\\s+([\\w:%.-]+)");
        Matcher matcher = pattern.matcher(output);
        return matcher.find() ? matcher.group(1) : "N/A";
    }

    private File createDummyInputFile(String directory) throws IOException {
        File inputFile = new File(directory, "input.txt");
        try (FileWriter writer = new FileWriter(inputFile)) {
            writer.write("This is a dummy file for the I/O-bound process to read and write. ".repeat(10000));
        }
        return inputFile;
    }
}