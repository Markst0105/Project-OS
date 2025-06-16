package br.usp.icmc.osapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ProducerConsumerSocketHandler socketHandler;

    public WebSocketConfig(ProducerConsumerSocketHandler socketHandler) {
        this.socketHandler = socketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Expose our handler at the "/ws/producer-consumer" endpoint
        registry.addHandler(socketHandler, "/ws/producer-consumer")
                // --- START OF FIX ---
                // Change from .setAllowedOrigins(...) to .setAllowedOriginPatterns("*")
                // This tells the WebSocket endpoint to accept connections from any origin,
                // including your Andromeda server URL.
                .setAllowedOriginPatterns("*");
        // --- END OF FIX ---
    }
}