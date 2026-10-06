package com.example.customermanagement.service;

import com.example.customermanagement.entity.Customer;

import java.time.LocalDate;
import java.util.List;

public interface CustomerService {

    /**
     * Persists a customer with the supplied name and date-of-birth details.
     */
    Customer createCustomer(
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    );

    /**
     * Returns all customers in stable ID order.
     */
    List<Customer> getAllCustomers();

    /**
     * Returns the requested customer or throws when no matching ID exists.
     */
    Customer getCustomerById(Long id);
}