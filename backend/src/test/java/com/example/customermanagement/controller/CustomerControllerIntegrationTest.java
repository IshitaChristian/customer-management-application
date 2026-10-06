package com.example.customermanagement.controller;

import com.example.customermanagement.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class CustomerControllerIntegrationTest {

    private static final String VALID_CUSTOMER_REQUEST = """
            {"firstName":"John","lastName":"Smith","dateOfBirth":"1990-05-15"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
    }

    @Test
    void adminCanCreateCustomerAndReceivesResponseDto() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.dateOfBirth").value("1990-05-15"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.session").doesNotExist());
    }

    @Test
    void repeatedCreateRequestsCreateSeparateCustomers() throws Exception {
        createCustomerAsAdmin();
        createCustomerAsAdmin();

        mockMvc.perform(get("/api/v1/customers")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void rejectsBlankNamesAndFutureDateOfBirth() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"","lastName":"","dateOfBirth":"%s"}
                                """.formatted(LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.firstName").value("must not be blank"))
                .andExpect(jsonPath("$.errors.lastName").value("must not be blank"))
                .andExpect(jsonPath("$.errors.dateOfBirth")
                        .value("must be a date in the past or in the present"));
    }

    @Test
    void rejectsNamesOverFiftyCharacters() throws Exception {
        String longName = "x".repeat(51);
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"%s","lastName":"Smith","dateOfBirth":"1990-05-15"}
                                """.formatted(longName)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName")
                        .value("size must be between 0 and 50"));
    }

    @Test
    void acceptsNamesAtTheFiftyCharacterLimit() throws Exception {
        String maxLengthName = "x".repeat(50);
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"%s","lastName":"Smith","dateOfBirth":"1990-05-15"}
                                """.formatted(maxLengthName)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value(maxLengthName));
    }

    @Test
    void acceptsTodaysDateOfBirth() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"John","lastName":"Smith","dateOfBirth":"%s"}
                                """.formatted(LocalDate.now())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dateOfBirth").value(LocalDate.now().toString()));
    }

    @Test
    void rejectsMissingAndMalformedDateOfBirth() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"John","lastName":"Smith"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dateOfBirth").value("must not be null"));

        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"John","lastName":"Smith","dateOfBirth":"not-a-date"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid request body"));
    }

    @Test
    void userCanListButCannotReadSingleCustomerOrCreate() throws Exception {
        createCustomerAsAdmin();

        mockMvc.perform(get("/api/v1/customers")
                        .with(user("user").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].dateOfBirth").doesNotExist());

        mockMvc.perform(get("/api/v1/customers/{id}", 999)
                        .with(user("user").roles("USER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/customers")
                        .with(user("user").roles("USER"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanReadCustomerById() throws Exception {
        createCustomerAsAdmin();
        Long customerId = customerRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/v1/customers")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].dateOfBirth").doesNotExist());

        mockMvc.perform(get("/api/v1/customers/{id}", customerId)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(customerId))
                .andExpect(jsonPath("$.dateOfBirth").value("1990-05-15"));
    }

    @Test
    void returnsNotFoundForMissingCustomer() throws Exception {
        mockMvc.perform(get("/api/v1/customers/{id}", 999)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message")
                        .value("Customer not found with provided id: 999"));
    }

    @Test
    void returnsUnauthorizedForUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Unauthorized"));

        mockMvc.perform(get("/api/v1/auth"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(post("/api/v1/customers")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void rejectsMissingOrInvalidCsrfTokenForStateChangingRequests() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Forbidden"));

        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf().useInvalidToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void authenticatedSessionPersistsAndLogoutInvalidatesSession() throws Exception {
        var login = mockMvc.perform(post("/api/v1/login")
                        .with(csrf())
                        .param("username", "user")
                        .param("password", "user123"))
                .andExpect(status().isNoContent())
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest()
                .getSession(false);
        assertNotNull(session);

        mockMvc.perform(get("/api/v1/auth").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("user"))
                .andExpect(jsonPath("$.role").value("USER"));

        mockMvc.perform(get("/api/v1/customers").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/logout")
                        .session(session)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/customers").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminSessionCanCreateAndReadCustomer() throws Exception {
        var login = mockMvc.perform(post("/api/v1/login")
                        .with(csrf())
                        .param("username", "admin")
                        .param("password", "admin123"))
                .andExpect(status().isNoContent())
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest()
                .getSession(false);
        assertNotNull(session);

        mockMvc.perform(post("/api/v1/customers")
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isCreated());
        Long customerId = customerRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/v1/customers/{id}", customerId)
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dateOfBirth").value("1990-05-15"));
    }

    @Test
    void loginRejectsInvalidCredentials() throws Exception {
        mockMvc.perform(post("/api/v1/login")
                        .with(csrf())
                        .param("username", "user")
                        .param("password", "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    void csrfEndpointProvidesTokenForFrontend() throws Exception {
        mockMvc.perform(get("/api/v1/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void corsAllowsConfiguredFrontendOriginsWithCredentials() throws Exception {
        mockMvc.perform(options("/api/v1/customers")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    void credentialPropertiesDoNotIncludePasswordsInTheirStringRepresentation() {
        var user = new com.example.customermanagement.config.SecurityUsersProperties.User(
                "alice",
                "do-not-log-this"
        );

        org.junit.jupiter.api.Assertions.assertFalse(user.toString().contains("do-not-log-this"));
        org.junit.jupiter.api.Assertions.assertTrue(user.toString().contains("[REDACTED]"));
    }

    @Test
    void configuredPasswordsAreStoredAsBcryptHashes() {
        var user = userDetailsService.loadUserByUsername("user");
        var admin = userDetailsService.loadUserByUsername("admin");

        org.junit.jupiter.api.Assertions.assertNotEquals("user123", user.getPassword());
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches(
                "user123",
                user.getPassword()
        ));
        org.junit.jupiter.api.Assertions.assertNotEquals("admin123", admin.getPassword());
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches(
                "admin123",
                admin.getPassword()
        ));
    }

    @Test
    void currentUserEndpointReturnsOnlyUsernameAndRole() throws Exception {
        mockMvc.perform(get("/api/v1/auth")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.authorities").doesNotExist());
    }

    @Test
    void customerListIsOrderedByIdAscending() throws Exception {
        insertCustomer(30L, "Thirty");
        insertCustomer(10L, "Ten");
        insertCustomer(20L, "Twenty");

        mockMvc.perform(get("/api/v1/customers")
                        .with(user("user").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains(10, 20, 30)))
                .andExpect(jsonPath("$[*].firstName",
                        contains("Ten", "Twenty", "Thirty")))
                .andExpect(jsonPath("$[*].dateOfBirth").doesNotExist());
    }

    @Test
    void emptyCustomerCollectionReturnsAnEmptyArray() throws Exception {
        mockMvc.perform(get("/api/v1/customers")
                        .with(user("user").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    private void createCustomerAsAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .with(user("admin").roles("ADMIN"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_CUSTOMER_REQUEST))
                .andExpect(status().isCreated());
    }

    private void insertCustomer(long id, String firstName) {
        jdbcTemplate.update(
                "INSERT INTO customers (id, first_name, last_name, date_of_birth) VALUES (?, ?, ?, ?)",
                id,
                firstName,
                "Test",
                java.sql.Date.valueOf("1990-05-15")
        );
    }

}
