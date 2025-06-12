// backend/src/main/java/br/usp/icmc/osapi/repository/UserRepository.java
package br.usp.icmc.osapi.repository;

import br.usp.icmc.osapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Finds a user if both username and password match
    Optional<User> findByUsernameAndPassword(String username, String password);
    // Finds a user by username to check for duplicates during registration
    Optional<User> findByUsername(String username);
}