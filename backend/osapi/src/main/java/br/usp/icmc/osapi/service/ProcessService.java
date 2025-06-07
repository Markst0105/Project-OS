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
        // Step 1: Extract executable from resources to a temporary file on the host machine
        String executableName = processType.equals("cpu") ? "cpu_process" : "io_process";
        File executableFile = getFileFromResources(executableName);
        File inputFile = null;

        // Step 2: Prepare the docker command as a list of arguments
        List<String> dockerCommand = new ArrayList<>();
        dockerCommand.add("docker");
        dockerCommand.add("run");
        dockerCommand.add("--rm"); // Clean up container after run
        dockerCommand.add("--cpus=0.5");
        dockerCommand.add("--memory=256m");
        dockerCommand.add("--cap-drop=ALL");

        // Mount the executable into the container at /app/executable
        dockerCommand.add("-v");
        dockerCommand.add(executableFile.getAbsolutePath() + ":/app/executable");
        // Set the working directory inside the container
        dockerCommand.add("-w");
        dockerCommand.add("/app");

        // Step 3: If it's an I/O process, create and mount the input file
        if (processType.equals("io")) {
            inputFile = createDummyInputFile(executableFile.getParent());
            dockerCommand.add("-v");
            dockerCommand.add(inputFile.getAbsolutePath() + ":/app/input.txt:ro"); // read-only
        }



        // Step 4: Add the image name and the shell command to run inside the container
        dockerCommand.add("gcc:latest"); // Image that has 'sh' and 'time'
//        dockerCommand.add("time-ready");  // Use our verified image
        dockerCommand.add("sh");
        dockerCommand.add("-c");
        dockerCommand.add("chmod +x ./executable && /usr/bin/time -p ./executable 2>&1"); // 2>&1 captures all output

        try {
            logger.info("--- Starting Docker Process Execution ---");
            logger.info("Executing command: {}", String.join(" ", dockerCommand));

            logger.info("FULL DOCKER COMMAND: {}", String.join(" ", dockerCommand));
            logger.info("ENV PATH: {}", System.getenv("PATH"));

            ProcessBuilder pb = new ProcessBuilder(dockerCommand);
            Process process = pb.start();

            String stdout = captureStream(process.getInputStream());
            String stderr = captureStream(process.getErrorStream());

            if (!process.waitFor(20, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new InterruptedException("Process timed out");
            }

            logger.info("Process stdout: [{}]", stdout);
            logger.error("Process stderr: [{}]", stderr);

            return parseTimeOutput(processType, stderr);
        } finally {
            executableFile.delete();
            if (inputFile != null) {
                inputFile.delete();
            }
        }
    }

    private String captureStream(InputStream inputStream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private ProcessMetricsResponse parseTimeOutput(String processType, String timeOutput) {
        String realTime = extractTime(timeOutput, "real");
        String userTime = extractTime(timeOutput, "user");
        String sysTime = extractTime(timeOutput, "sys");

        if (processType.equals("cpu")) {
            return new ProcessMetricsResponse(
                    "cpu", realTime, userTime, sysTime,
                    "The CPU-bound process spent most of its time in 'user' mode (userTime), performing calculations. The high 'user' time compared to 'real' time indicates high CPU saturation.",
                    List.of(85.0, 93.0, 95.0, 92.0, 96.0, 94.0, 95.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s")
            );
        } else { // io
            return new ProcessMetricsResponse(
                    "io", realTime, userTime, sysTime,
                    "The I/O-bound process has a large 'real' time but very low 'user' and 'sys' time. This means the process spent most of its time waiting for I/O operations (like reading/writing files), not using the CPU.",
                    List.of(5.0, 15.0, 4.0, 12.0, 6.0, 14.0, 5.0),
                    List.of("1s", "2s", "3s", "4s", "5s", "6s", "7s")
            );
        }
    }

    private String extractTime(String output, String type) {
        Pattern pattern = Pattern.compile(type + "\\s+([0-9.]+)");
        Matcher matcher = pattern.matcher(output);
        return matcher.find() ? matcher.group(1) : "N/A";
    }

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