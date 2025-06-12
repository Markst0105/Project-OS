// backend/src/main/java/br/usp/icmc/osapi/controller/FeedbackController.java
package br.usp.icmc.osapi.controller;

import br.usp.icmc.osapi.dto.CreateFeedbackRequest;
import br.usp.icmc.osapi.dto.FeedbackDto;
import br.usp.icmc.osapi.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping("/{moduleName}")
    public ResponseEntity<List<FeedbackDto>> getFeedback(@PathVariable String moduleName) {
        return ResponseEntity.ok(feedbackService.getFeedbackForModule(moduleName));
    }

    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody CreateFeedbackRequest request) {
        // The userId is now part of the request body
        if (request.userId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in to post feedback.");
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.createFeedback(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred.");
        }
    }

    @DeleteMapping("/{id}")
    // The frontend will send the logged-in user's ID as a request parameter for verification
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id, @RequestParam Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in to delete feedback.");
        }
        try {
            feedbackService.deleteFeedback(id, userId);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}