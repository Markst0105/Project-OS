package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.ExecutionResponse;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExecutionService {

    private static final int TIMEOUT_SECONDS = 10;

    public ExecutionResponse compileAndRun(String cCode) throws IOException, InterruptedException {
        // Create a temporary directory to store the C file
        Path tempDir = Files.createTempDirectory("c-execution");
        File sourceFile = new File(tempDir.toFile(), "main.c");

        try {
            // Write the received C code to the temporary file
            Files.writeString(sourceFile.toPath(), cCode);

            // Command to run inside the Docker container
            String dockerCommand = "gcc main.c -o main.out && ./main.out";

            // Use ProcessBuilder to run the Docker command
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "--cpus=0.5", "--memory=256m", // Resource limits
                    "--cap-drop=ALL", // Drop all Linux capabilities for security
                    "-v", sourceFile.getAbsolutePath() + ":/app/main.c:ro", // Mount C file as read-only
                    "c-compiler-image", // The image we built earlier
                    "sh", "-c", dockerCommand // The command to execute
            );

            Process process = processBuilder.start();

            // Capture stdout
            String stdout = new BufferedReader(new InputStreamReader(process.getInputStream()))
                    .lines().collect(Collectors.joining("\n"));

            // Capture stderr
            String stderr = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                    .lines().collect(Collectors.joining("\n"));

            // Wait for the process to finish, with a timeout
            if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                return new ExecutionResponse("", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.");
            }

            return new ExecutionResponse(stdout, stderr);

        } finally {
            // Clean up the temporary file and directory
            sourceFile.delete();
            tempDir.toFile().delete();
        }
    }
}