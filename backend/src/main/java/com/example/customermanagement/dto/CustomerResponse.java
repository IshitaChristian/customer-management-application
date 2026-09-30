package com.example.customermanagement.dto;

import com.example.customermanagement.entity.Customer;

import java.time.LocalDate;

public record CustomerResponse(Long id, String firstName, String lastName, LocalDate dateOfBirth) {

    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getDateOfBirth()
        );
    }
}
