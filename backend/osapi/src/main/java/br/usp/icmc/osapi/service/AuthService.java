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
        newUser.setRole("USER"); // <-- ADD THIS LINE to set default role
        User savedUser = userRepository.save(newUser);

        // We will update the UserDto later to include the role
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    public UserDto login(AuthRequest request) {
        User user = userRepository.findByUsernameAndPassword(request.username(), request.password())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));
        return new UserDto(user.getId(), user.getUsername(), user.getRole());
    }

    public User getCurrentUser() {
        // In a stateless, simple auth system, the backend doesn't know the current user.
        // The user ID must be passed from the frontend with each request.
        // This method is a placeholder. Real logic would come from a security context.
        return null;
    }
}