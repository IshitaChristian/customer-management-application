package com.example.customermanagement.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {

    /**
     * Provides a CSRF token for the frontend's cookie-authenticated requests.
     */
    @GetMapping("/api/v1/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        csrfToken.getToken();
        return csrfToken;
    }
}
