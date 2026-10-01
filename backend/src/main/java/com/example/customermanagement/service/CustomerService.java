package com.example.customermanagement.service;

import com.example.customermanagement.entity.Customer;

import java.util.List;

public interface CustomerService {

    Customer createCustomer(
            String firstName,
            String lastName,
            java.time.LocalDate dateOfBirth
    );

    List<Customer> getAllCustomers();

    Customer getCustomerById(Long id);
}