// backend/src/main/java/br/usp/icmc/osapi/repository/FeedbackRepository.java
package br.usp.icmc.osapi.repository;

import br.usp.icmc.osapi.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Finds all feedback for a specific module, ordered by newest first
    List<Feedback> findByModuleNameOrderByCreatedAtDesc(String moduleName);
}