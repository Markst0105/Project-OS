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

        // LinkedHashMap is perfect for LRU. The 'true' flag makes it order by access.
        LinkedHashMap<Integer, Boolean> lruCache = new LinkedHashMap<>(numFrames, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Boolean> eldest) {
                // This method is called after a 'put'. If it returns true, the eldest entry is removed.
                return size() > numFrames;
            }
        };

        for (int page : pageReferences) {
            boolean isFault = false;
            Integer replacedPage = null;

            if (!lruCache.containsKey(page)) {
                isFault = true;
                pageFaults++;
                // If the cache is full, we need to know which page is about to be removed.
                if (lruCache.size() == numFrames) {
                    // The eldest entry is the first one in the iterator.
                    replacedPage = lruCache.keySet().iterator().next();
                }
            }

            // Putting the page in (or accessing it) makes it the most recently used.
            lruCache.put(page, true);

            // The keyset of an access-ordered LinkedHashMap is the correct state of the frames.
            steps.add(new SimulationStep(page, new ArrayList<>(lruCache.keySet()), isFault, replacedPage));
        }

        return new MemorySimulationResponse(steps, pageFaults, pageReferences.size() - pageFaults, "LRU", numFrames);
    }
}