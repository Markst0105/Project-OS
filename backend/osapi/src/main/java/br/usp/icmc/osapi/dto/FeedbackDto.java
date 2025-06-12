package br.usp.icmc.osapi.dto;

import java.time.Instant;
public record FeedbackDto(Long id, String content, String username, Long userId, Instant createdAt) {}