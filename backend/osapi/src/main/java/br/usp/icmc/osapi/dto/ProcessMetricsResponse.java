package br.usp.icmc.osapi.dto;

import java.util.List;

public record ProcessMetricsResponse(
        String processType,
        String realTime,
        String userTime,
        String sysTime,
        String explanation,
        List<Double> cpuUsage,
        List<String> timeline
) {}