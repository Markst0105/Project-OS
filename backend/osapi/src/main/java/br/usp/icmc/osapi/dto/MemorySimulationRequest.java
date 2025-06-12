package br.usp.icmc.osapi.dto;

public record MemorySimulationRequest(
        String algorithm,
        int numFrames,
        String referenceString
) {}