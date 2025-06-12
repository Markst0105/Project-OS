package br.usp.icmc.osapi.dto;

import java.util.List;

public record SimulationStep(
        int pageReferenced,
        List<Integer> memoryFrames,
        boolean isPageFault,
        Integer pageToReplace // Can be null if there was no replacement (e.g., empty frame was used)
) {}