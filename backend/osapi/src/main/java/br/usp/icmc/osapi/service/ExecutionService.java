package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.ExecutionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(ExecutionService.class);
    private static final int TIMEOUT_SECONDS = 10;

    public ExecutionResponse compileAndRun(String cCode) throws IOException, InterruptedException {
        // This command tells gcc to read C code from standard input ("-x c -")
        String dockerInternalCommand = "gcc -o main.out -x c - && ./main.out";

        ProcessBuilder processBuilder = new ProcessBuilder(
                "docker", "run", "--rm", "-i", // '-i' is crucial for keeping stdin open
                "--cpus=0.5", "--memory=256m",
                "--cap-drop=ALL",
                "c-compiler-image",
                "sh", "-c", dockerInternalCommand
        );

        logger.info("--- Starting C Code Execution via Stdin ---");
        Process process = processBuilder.start();

        // Write the C code directly to the container's standard input
        try (OutputStreamWriter writer = new OutputStreamWriter(process.getOutputStream())) {
            writer.write(cCode);
        } // The try-with-resources block automatically closes the writer, signaling "end of file" to gcc

        // Capture stdout and stderr as before
        String stdout = new BufferedReader(new InputStreamReader(process.getInputStream()))
                .lines().collect(Collectors.joining("\n"));

        String stderr = new BufferedReader(new InputStreamReader(process.getErrorStream()))
                .lines().collect(Collectors.joining("\n"));

        if (!process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            return new ExecutionResponse("", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.");
        }

        logger.info("Execution stdout: [{}]", stdout);
        logger.error("Execution stderr: [{}]", stderr);
        logger.info("--- Finished C Code Execution ---");

        return new ExecutionResponse(stdout, stderr);
    }
}