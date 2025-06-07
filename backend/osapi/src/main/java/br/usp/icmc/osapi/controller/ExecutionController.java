package br.usp.icmc.osapi.controller;

import br.usp.icmc.osapi.dto.ExecutionRequest;
import br.usp.icmc.osapi.dto.ExecutionResponse;
import br.usp.icmc.osapi.service.ExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping("/execute-c")
    public ResponseEntity<ExecutionResponse> executeC(@RequestBody ExecutionRequest request) {
        try {
            ExecutionResponse response = executionService.compileAndRun(request.code());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ExecutionResponse errorResponse = new ExecutionResponse("", "Server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}