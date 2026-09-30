package com.example.customermanagement.dto;

import java.time.LocalDate;

public record CreateCustomerRequest(String firstName, String lastName, LocalDate dateOfBirth) {

}
