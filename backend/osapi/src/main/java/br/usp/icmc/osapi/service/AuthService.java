// backend/src/main/java/br/usp/icmc/osapi/service/AuthService.java
package br.usp.icmc.osapi.service;

import br.usp.icmc.osapi.dto.AuthRequest;
import br.usp.icmc.osapi.dto.UserDto;
import br.usp.icmc.osapi.model.User;
import br.usp.icmc.osapi.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto register(AuthRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("Username is already taken.");
        }
        User newUser = new User();
        newUser.setUsername(request.username());
        newUser.setPassword(request.password());
        newUser.setRole("USER"); // Set the default role for new users
        User savedUser = userRepository.save(newUser);

        // Return the DTO with the role included
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    public UserDto login(AuthRequest request) {
        User user = userRepository.findByUsernameAndPassword(request.username(), request.password())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));

        // Return the DTO with the role included
        return new UserDto(user.getId(), user.getUsername(), user.getRole());
    }

    // This placeholder is still needed for the FeedbackController's dependency
    public User getCurrentUser() {
        return null;
    }
}