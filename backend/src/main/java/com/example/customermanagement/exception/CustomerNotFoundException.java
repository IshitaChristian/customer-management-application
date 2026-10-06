package com.example.customermanagement.exception;

public class CustomerNotFoundException extends RuntimeException{

    public CustomerNotFoundException(Long id){
        super("Customer not found with provided id: " + id);
    }
}
