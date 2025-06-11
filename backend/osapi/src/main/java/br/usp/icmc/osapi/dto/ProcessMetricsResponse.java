package br.usp.icmc.osapi.dto;

import java.util.List;

public record ProcessMetricsResponse(
        // Existing fields for basic timing
        String processType,
        String realTime,
        String userTime,
        String sysTime,

        // New fields for detailed metrics
        String cpuPercentage,
        String voluntarySwitches,
        String involuntarySwitches,

        // Fields for frontend visualization
        String explanation,
        List<Double> cpuUsage,
        List<String> timeline
) {}