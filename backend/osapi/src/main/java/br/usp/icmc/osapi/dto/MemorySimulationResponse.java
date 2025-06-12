package br.usp.icmc.osapi.dto;

import java.util.List;

public record MemorySimulationResponse(
        List<SimulationStep> steps,
        int totalPageFaults,
        int totalHits,
        String algorithm,
        int numFrames
) {}