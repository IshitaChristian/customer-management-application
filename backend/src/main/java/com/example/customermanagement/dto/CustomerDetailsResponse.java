package com.example.customermanagement.dto;

import com.example.customermanagement.entity.Customer;

import java.time.LocalDate;

public record CustomerDetailsResponse(
        Long id,
        String firstName,
        String lastName,
        LocalDate dateOfBirth
) {

    public static CustomerDetailsResponse fromCustomer(Customer customer) {
        return new CustomerDetailsResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getDateOfBirth()
        );
    }
}
