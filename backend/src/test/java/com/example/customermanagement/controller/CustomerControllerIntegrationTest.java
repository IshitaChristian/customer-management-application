package com.example.customermanagement.controller;
import com.example.customermanagement.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
    }

    @Test
    void shouldCreateCustomer() throws Exception {

        String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "Smith",
                    "dateOfBirth": "1990-05-15"
                }
                """;

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated());
    }


    @Test
    void shouldRejectInvalidCustomer() throws Exception {

        String requestBody = """
            {
                "firstName": "",
                "lastName": "",
                "dateOfBirth": "2030-01-01"
            }
            """;

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.firstName")
                        .value("must not be blank"))
                .andExpect(jsonPath("$.errors.lastName")
                        .value("must not be blank"))
                .andExpect(jsonPath("$.errors.dateOfBirth")
                        .value("must be a date in the past or in the present"));
    }

    @Test
    void shouldGetAllCustomers() throws Exception {

        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetCustomerById() throws Exception {

        String requestBody = """
            {
                "firstName": "John",
                "lastName": "Smith",
                "dateOfBirth": "1990-05-15"
            }
            """;

        mockMvc.perform(
                        post("/api/v1/customers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andExpect(status().isCreated());

        Long customerId = customerRepository.findAll()
                .getFirst()
                .getId();

        mockMvc.perform(get("/api/v1/customers/{id}", customerId))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnNotFoundForMissingCustomer() throws Exception {

        mockMvc.perform(get("/api/v1/customers/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message")
                        .value("Customer not found with provided id: 999"));
    }

}
