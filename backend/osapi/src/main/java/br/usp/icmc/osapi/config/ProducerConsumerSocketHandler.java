package br.usp.icmc.osapi.config;

import br.usp.icmc.osapi.service.ProducerConsumerService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ProducerConsumerSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(ProducerConsumerSocketHandler.class);
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    private final ProducerConsumerService simulationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProducerConsumerSocketHandler(ProducerConsumerService simulationService) {
        this.simulationService = simulationService;
        // When the service's state changes, call our broadcast method
        this.simulationService.setOnStateChange(this::broadcastBufferState);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("WebSocket connection established: {}", session.getId());
        sessions.add(session);
        // Send initial state on connection
        broadcastBufferState();
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        JsonNode jsonNode = objectMapper.readTree(payload);
        String action = jsonNode.get("action").asText();

        logger.info("Received action: {}", action);

        if ("start".equals(action)) {
            JsonNode config = jsonNode.get("config");
            int numProducers = config.get("numProducers").asInt();
            int numConsumers = config.get("numConsumers").asInt();
            int bufferSize = config.get("bufferSize").asInt();
            simulationService.startSimulation(numProducers, numConsumers, bufferSize);
        } else if ("stop".equals(action)) {
            simulationService.stopSimulation();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WebSocket connection closed: {}", session.getId());
        sessions.remove(session);
        // If the last client disconnects, stop the simulation
        if (sessions.isEmpty()) {
            simulationService.stopSimulation();
        }
    }

    public void broadcastBufferState() {
        // OLD: List<Integer> bufferState = simulationService.getBufferState();
        Map<String, Object> simulationState = simulationService.getSimulationState(); // NEW
        try {
            // OLD: String message = objectMapper.writeValueAsString(Map.of("buffer", bufferState));
            String message = objectMapper.writeValueAsString(simulationState); // NEW
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (IOException e) {
            logger.error("Error broadcasting buffer state", e);
        }
    }
}
