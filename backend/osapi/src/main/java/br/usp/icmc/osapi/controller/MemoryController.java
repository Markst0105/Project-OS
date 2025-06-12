package br.usp.icmc.osapi.controller;

import br.usp.icmc.osapi.dto.MemorySimulationRequest;
import br.usp.icmc.osapi.dto.MemorySimulationResponse;
import br.usp.icmc.osapi.service.MemoryManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memory")
public class MemoryController {

    private final MemoryManagementService memoryService;

    public MemoryController(MemoryManagementService memoryService) {
        this.memoryService = memoryService;
    }

    @PostMapping("/simulate")
    public ResponseEntity<?> simulate(@RequestBody MemorySimulationRequest request) {
        try {
            MemorySimulationResponse response = memoryService.runSimulation(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
        }
    }
}