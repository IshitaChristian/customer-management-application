package com.example.customermanagement.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security")
public record SecurityUsersProperties(
        @NotNull User user,
        @NotNull User admin
) {

    public record User(
            @NotBlank String username,
            @NotBlank String password
    ) {

        @Override
        public String toString() {
            return "User[username=" + username + ", password=[REDACTED]]";
        }
    }
}
