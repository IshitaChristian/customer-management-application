package com.example.customermanagement.service;

import com.example.customermanagement.entity.Customer;
import com.example.customermanagement.exception.CustomerNotFoundException;
import com.example.customermanagement.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer createCustomer(
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    ) {
        Customer customer = new Customer(
                firstName,
                lastName,
                dateOfBirth
        );

        return customerRepository.save(customer);
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }
}
