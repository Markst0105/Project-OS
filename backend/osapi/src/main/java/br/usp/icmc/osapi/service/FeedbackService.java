// backend/src/main/java/br/usp/icmc/osapi/service/FeedbackService.java
package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.CreateFeedbackRequest;
import br.usp.icmc.osapi.dto.FeedbackDto;
import br.usp.icmc.osapi.model.Feedback;
import br.usp.icmc.osapi.model.User;
import br.usp.icmc.osapi.repository.FeedbackRepository;
import br.usp.icmc.osapi.repository.UserRepository; // Import UserRepository
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository; // Add UserRepository

    // Update constructor
    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public List<FeedbackDto> getFeedbackForModule(String moduleName) {
        return feedbackRepository.findByModuleNameOrderByCreatedAtDesc(moduleName).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Method now uses userId from the request
    public FeedbackDto createFeedback(CreateFeedbackRequest request) {
        User author = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Feedback feedback = new Feedback();
        feedback.setModuleName(request.moduleName());
        feedback.setContent(request.content());
        feedback.setAuthor(author);
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToDto(savedFeedback);
    }

    @Transactional
    public void deleteFeedback(Long feedbackId, Long currentUserId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

        // UPDATED LOGIC: Allow deletion if user is the author OR a moderator
        if (!feedback.getAuthor().getId().equals(currentUser.getId()) && !"MODERATOR".equals(currentUser.getRole())) {
            throw new SecurityException("User not authorized to delete this feedback");
        }
        feedbackRepository.deleteById(feedbackId);
    }

    private FeedbackDto mapToDto(Feedback feedback) {
        return new FeedbackDto(
                feedback.getId(),
                feedback.getContent(),
                feedback.getAuthor().getUsername(),
                feedback.getAuthor().getId(),
                feedback.getCreatedAt()
        );
    }
}