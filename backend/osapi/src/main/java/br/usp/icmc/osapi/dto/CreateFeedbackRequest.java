package br.usp.icmc.osapi.dto;

public record CreateFeedbackRequest(String moduleName, String content, Long userId) {}