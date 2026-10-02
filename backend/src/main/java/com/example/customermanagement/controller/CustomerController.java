package com.example.customermanagement.controller;

import com.example.customermanagement.dto.CustomerDetailsResponse;
import com.example.customermanagement.dto.CustomerRequest;
import com.example.customermanagement.dto.CustomerSummaryResponse;
import com.example.customermanagement.entity.Customer;
import com.example.customermanagement.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDetailsResponse createCustomer(
            @Valid @RequestBody CustomerRequest request
    ) {
        Customer customer = customerService.createCustomer(
                request.firstName(),
                request.lastName(),
                request.dateOfBirth()
        );
        return CustomerDetailsResponse.fromCustomer(customer);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<CustomerSummaryResponse> getAllCustomers() {
        return customerService.getAllCustomers()
                .stream()
                .map(CustomerSummaryResponse::fromCustomer)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerDetailsResponse getCustomerById(@PathVariable Long id) {
        Customer customer = customerService.getCustomerById(id);
        return CustomerDetailsResponse.fromCustomer(customer);
    }
}
