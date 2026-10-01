package com.example.customermanagement.exception;

import lombok.Getter;

import java.util.Map;

@Getter
public class ErrorResponse {

    private final int status;
    private final String message;
    private final Map<String, String> errors;

    public ErrorResponse(int status, String message) {
        this.status = status;
        this.message = message;
        this.errors = null;
    }

    public ErrorResponse(int status, String message, Map<String, String> errors) {
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
}