// backend/src/main/java/br/usp/icmc/osapi/controller/ProcessController.java
package br.usp.icmc.osapi.controller;

import br.usp.icmc.osapi.dto.ProcessMetricsResponse;
import br.usp.icmc.osapi.service.ProcessService;
import org.slf4j.Logger; // <-- ADD THIS IMPORT
import org.slf4j.LoggerFactory; // <-- ADD THIS IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/processes")
public class ProcessController {

    private final ProcessService processService;
    // ADD THIS LOGGER INSTANCE
    private static final Logger logger = LoggerFactory.getLogger(ProcessController.class);

    public ProcessController(ProcessService processService) {
        this.processService = processService;
    }

    @GetMapping("/run/{processType}")
    public ResponseEntity<?> runProcess(@PathVariable String processType) {
        if (!processType.equals("cpu") && !processType.equals("io")) {
            return ResponseEntity.badRequest().body("Invalid process type. Use 'cpu' or 'io'.");
        }
        try {
            ProcessMetricsResponse response = processService.executeAndMeasure(processType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // ADD THIS LOGGING LINE
            logger.error("Error executing process from controller", e);
            return ResponseEntity.internalServerError().body("Error executing process: " + e.getMessage());
        }
    }
}