package com.example.customermanagement.controller;
import com.example.customermanagement.dto.CreateCustomerRequest;
import com.example.customermanagement.dto.CustomerResponse;
import com.example.customermanagement.entity.Customer;
import com.example.customermanagement.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(@Valid @RequestBody CreateCustomerRequest request){
        Customer customer = customerService.createCustomer(
                request.firstName(),
                request.lastName(),
                request.dateOfBirth()
        );
        return CustomerResponse.from(customer);
    }

    @GetMapping
    public List<CustomerResponse> getAllCustomers(){
        return customerService.getAllCustomers()
                .stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomerById(@PathVariable Long id){
        Customer customer = customerService.getCustomerById(id);
        return CustomerResponse.from(customer);
    }
}
