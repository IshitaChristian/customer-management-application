package com.example.customermanagement.dto;

import com.example.customermanagement.entity.Customer;

public record CustomerSummaryResponse(
        Long id,
        String firstName,
        String lastName
) {

    public static CustomerSummaryResponse fromCustomer(Customer customer) {
        return new CustomerSummaryResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName()
        );
    }
}
