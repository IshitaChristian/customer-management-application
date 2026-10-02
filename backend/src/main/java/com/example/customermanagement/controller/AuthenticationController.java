package com.example.customermanagement.controller;

import com.example.customermanagement.dto.AuthenticatedUserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    @GetMapping("/api/v1/auth")
    public AuthenticatedUserResponse currentUser(Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.equals("ROLE_USER")
                        || authority.equals("ROLE_ADMIN"))
                .map(authority -> authority.substring("ROLE_".length()))
                .findFirst()
                .orElseThrow();

        return new AuthenticatedUserResponse(authentication.getName(), role);
    }
}
