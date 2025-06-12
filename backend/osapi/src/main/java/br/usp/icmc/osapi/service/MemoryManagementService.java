package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.MemorySimulationRequest;
import br.usp.icmc.osapi.dto.MemorySimulationResponse;
import br.usp.icmc.osapi.dto.SimulationStep;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Stream;

@Service
public class MemoryManagementService {

    public MemorySimulationResponse runSimulation(MemorySimulationRequest request) {
        List<Integer> pageReferences = Stream.of(request.referenceString().split("[,\\s]+"))
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .toList();

        return switch (request.algorithm().toUpperCase()) {
            case "FIFO" -> simulateFIFO(pageReferences, request.numFrames());
            case "LRU" -> simulateLRU(pageReferences, request.numFrames());
            default -> throw new IllegalArgumentException("Unknown algorithm: " + request.algorithm());
        };
    }

    private MemorySimulationResponse simulateFIFO(List<Integer> pageReferences, int numFrames) {
        List<SimulationStep> steps = new ArrayList<>();
        int pageFaults = 0;
        List<Integer> frames = new ArrayList<>();
        Queue<Integer> fifoQueue = new LinkedList<>();

        for (int page : pageReferences) {
            boolean isFault = false;
            Integer replacedPage = null;

            if (!frames.contains(page)) {
                isFault = true;
                pageFaults++;
                if (frames.size() < numFrames) {
                    frames.add(page);
                    fifoQueue.add(page);
                } else {
                    replacedPage = fifoQueue.poll();
                    int frameIndex = frames.indexOf(replacedPage);
                    frames.set(frameIndex, page);
                    fifoQueue.add(page);
                }
            }
            steps.add(new SimulationStep(page, new ArrayList<>(frames), isFault, replacedPage));
        }
        return new MemorySimulationResponse(steps, pageFaults, pageReferences.size() - pageFaults, "FIFO", numFrames);
    }

    private MemorySimulationResponse simulateLRU(List<Integer> pageReferences, int numFrames) {
        List<SimulationStep> steps = new ArrayList<>();
        int pageFaults = 0;
        List<Integer> frames = new ArrayList<>();
        // For LRU, we can use a list where the end is the most recently used.
        List<Integer> lruTracker = new LinkedList<>();

        for (int page : pageReferences) {
            boolean isFault = false;
            Integer replacedPage = null;

            if (!frames.contains(page)) {
                isFault = true;
                pageFaults++;
                if (frames.size() < numFrames) {
                    frames.add(page);
                } else {
                    replacedPage = lruTracker.remove(0); // Remove the least recently used (at the front)
                    int frameIndex = frames.indexOf(replacedPage);
                    frames.set(frameIndex, page);
                }
            }
            // Move the currently accessed page to the end of the tracker (most recently used)
            lruTracker.remove(Integer.valueOf(page));
            lruTracker.add(page);

            steps.add(new SimulationStep(page, new ArrayList<>(frames), isFault, replacedPage));
        }
        return new MemorySimulationResponse(steps, pageFaults, pageReferences.size() - pageFaults, "LRU", numFrames);
    }
}