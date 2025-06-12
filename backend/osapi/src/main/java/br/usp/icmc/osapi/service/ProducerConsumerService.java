package br.usp.icmc.osapi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class ProducerConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(ProducerConsumerService.class);

    private enum WorkerState { RUNNING, WAITING, TERMINATED }
    private record Worker(int id, WorkerState state) {}

    private BlockingQueue<Integer> buffer;
    private ExecutorService workerExecutor;
    private ScheduledExecutorService broadcastScheduler; // NEW: A dedicated scheduler for broadcasting
    private volatile boolean isRunning = false;

    private final ConcurrentMap<Integer, Worker> producerStates = new ConcurrentHashMap<>();
    private final ConcurrentMap<Integer, Worker> consumerStates = new ConcurrentHashMap<>();

    private Runnable onStateChange;

    public void setOnStateChange(Runnable onStateChange) {
        this.onStateChange = onStateChange;
    }

    public void startSimulation(int numProducers, int numConsumers, int bufferSize) {
        if (isRunning) {
            stopSimulation();
        }
        logger.info("Starting simulation: P={}, C={}, Size={}", numProducers, numConsumers, bufferSize);

        buffer = new ArrayBlockingQueue<>(bufferSize);
        workerExecutor = Executors.newFixedThreadPool(numProducers + numConsumers);
        producerStates.clear();
        consumerStates.clear();
        isRunning = true;

        // Start the broadcast scheduler to send updates every 200ms (5 times/sec)
        broadcastScheduler = Executors.newSingleThreadScheduledExecutor();
        broadcastScheduler.scheduleAtFixedRate(this::broadcastStateChange, 0, 200, TimeUnit.MILLISECONDS);

        for (int i = 0; i < numProducers; i++) {
            final int producerId = i + 1;
            producerStates.put(producerId, new Worker(producerId, WorkerState.RUNNING));
            workerExecutor.submit(() -> runProducer(producerId));
        }

        for (int i = 0; i < numConsumers; i++) {
            final int consumerId = i + 1;
            consumerStates.put(consumerId, new Worker(consumerId, WorkerState.RUNNING));
            workerExecutor.submit(() -> runConsumer(consumerId));
        }
    }

    private void runProducer(int id) {
        try {
            while (isRunning && !Thread.currentThread().isInterrupted()) {
                // State: Actively "producing" (simulating work)
                producerStates.put(id, new Worker(id, WorkerState.RUNNING));
                Thread.sleep(ThreadLocalRandom.current().nextLong(800, 2000));

                int item = ThreadLocalRandom.current().nextInt(100);

                // State: About to wait for buffer space
                producerStates.put(id, new Worker(id, WorkerState.WAITING));
                buffer.put(item); // BLOCKS if buffer is full

                logger.info("Producer {} produced: {}", id, item);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            logger.error("Unhandled exception in producer {}", id, e);
        } finally {
            producerStates.put(id, new Worker(id, WorkerState.TERMINATED));
        }
    }

    private void runConsumer(int id) {
        try {
            while (isRunning && !Thread.currentThread().isInterrupted()) {
                // State: About to wait for an item
                consumerStates.put(id, new Worker(id, WorkerState.WAITING));
                int item = buffer.take(); // BLOCKS if buffer is empty

                // State: Actively "consuming" (simulating work)
                consumerStates.put(id, new Worker(id, WorkerState.RUNNING));
                logger.info("Consumer {} consumed: {}", id, item);
                Thread.sleep(ThreadLocalRandom.current().nextLong(800, 2000));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            logger.error("Unhandled exception in consumer {}", id, e);
        } finally {
            consumerStates.put(id, new Worker(id, WorkerState.TERMINATED));
        }
    }

    public void stopSimulation() {
        if (!isRunning) return;
        logger.info("Stopping simulation...");
        isRunning = false; // Set the flag to stop the worker loops

        // Immediately shutdown the executors to interrupt threads
        if (workerExecutor != null) {
            workerExecutor.shutdownNow();
        }
        if (broadcastScheduler != null) {
            broadcastScheduler.shutdownNow();
        }

        // Wait a very brief moment to allow threads to catch the interrupt
        try {
            if (workerExecutor != null) {
                workerExecutor.awaitTermination(250, TimeUnit.MILLISECONDS);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // After stopping, explicitly set all states to TERMINATED for a clean final UI state
        producerStates.replaceAll((id, worker) -> new Worker(id, WorkerState.TERMINATED));
        consumerStates.replaceAll((id, worker) -> new Worker(id, WorkerState.TERMINATED));

        // CRITICAL FIX: Broadcast the final "stopped" state to the UI
        broadcastStateChange();
    }

    private void broadcastStateChange() {
        if (onStateChange != null) {
            onStateChange.run();
        }
    }

    public Map<String, Object> getSimulationState() {
        // This method now only reads the current state. It doesn't trigger changes.
        return Map.of(
                "buffer", List.copyOf(buffer != null ? buffer : List.of()),
                "producers", producerStates.values().stream()
                        .sorted(Comparator.comparing(Worker::id))
                        .collect(Collectors.toList()),
                "consumers", consumerStates.values().stream()
                        .sorted(Comparator.comparing(Worker::id))
                        .collect(Collectors.toList()),
                "isRunning", this.isRunning
        );
    }
}
