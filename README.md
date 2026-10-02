# Customer Management Application

## Run Locally and Sign In

Follow these steps in order. Keep both development servers running in separate terminals while using the application.

### 1. Install prerequisites

- JDK 21.
- Node.js 22 and npm. Node 22 is the version used by CI.
- Git.
- Network access for the first run so the Maven wrapper can download Maven/dependencies and npm can install frontend packages.

The Maven wrapper is included, so a separate Maven installation is not needed. No separate database installation or setup is needed; the application uses an in-memory H2 database.

### 2. Check out the supplied Git bundle

From the directory containing the shared `customer-management-app.bundle` file, run:

```sh
git clone customer-management-app.bundle customer-management-application
cd customer-management-application
```

This checks out the bundle's default branch, `feature/customer_management_app`. No GitHub clone or remote repository access is required.

### 3. Start the backend (Terminal 1)

From the repository root, run:

```sh
cd backend
./mvnw spring-boot:run
```

The `local` Spring profile is the default when no profile is specified. It loads the assessment/demo accounts and permits the session cookie over local HTTP, so no VM option or environment variable is needed for the assessment. On first start, the Maven wrapper may take time to download Maven and dependencies. The backend listens on **http://localhost:8080**.

### 4. Install frontend packages and start the frontend (Terminal 2)

Open a second terminal, change to the cloned repository root, and run:

```sh
cd frontend
npm install
npm run dev
```

`npm install` installs the frontend dependencies. Vite serves the frontend at **http://localhost:5173**. Keep this terminal open as well as the backend terminal.

### 5. Open the application and sign in

Once both servers are running, open **http://localhost:5173** in a browser. The unauthenticated root route redirects to the login page at **http://localhost:5173/login**. Sign in with one of these local technical-assessment/demo accounts:

| Role | Username | Password | What this account can do |
| --- | --- | --- | --- |
| `USER` | `user` | `user123` | View the customer list; cannot create customers or open customer details. |
| `ADMIN` | `admin` | `admin123` | View the list, create customers, and open customer details, including date of birth. |

After a successful login, the application navigates to `/customers`. These credentials are only for running the local assessment application; do not reuse them outside the demo or treat them as production credentials. See [Configuration and Credentials](#configuration-and-credentials) for environment-variable overrides.

## Overview

A small customer-management application with a React/TypeScript frontend and a Spring Boot REST API. Signed-in users can view a customer list containing names and IDs. Administrators can also create customers and open individual customer details, including date of birth.

| Role | Access and purpose |
| --- | --- |
| `USER` | View the customer summary list. This least-privilege role allows routine list access without exposing date of birth or administrative actions. |
| `ADMIN` | View the list, create customers, and view an individual customer's details, including date of birth. This role is for users who need those privileged customer-management operations. |

Date of birth is treated as personally identifiable information (PII), so it is omitted from the list and only returned by the admin-authorized detail endpoint. The backend enforces role access; hiding administrator-only controls in the frontend is a usability measure, not an authorization boundary.

## Technology Stack

| Area | Technologies in use |
| --- | --- |
| Backend | Java 21, Spring Boot 4.0.8, Spring MVC, Spring Security, Spring Data JPA, Jakarta Bean Validation, H2, Maven |
| Frontend | React 19, TypeScript 6, Vite 8, React Router |
| UI and forms | Material UI, MUI X Date Pickers, AG Grid, React Hook Form, Zod, `@hookform/resolvers`, `date-fns` |
| API and tests | Axios, JUnit 5/Spring Boot Test/Spring Security Test, Vitest, React Testing Library, jsdom |

Lombok is used in the backend entity. Frontend linting uses ESLint and TypeScript ESLint.

## Project Structure

```text
backend/
  src/main/java/.../config       Security, CORS, and credential properties
  src/main/java/.../controller   Authentication, CSRF, and customer endpoints
  src/main/java/.../dto          API request and response records
  src/main/java/.../entity       JPA customer entity
  src/main/java/.../repository   Spring Data repository
  src/main/java/.../service      Customer operations
  src/main/java/.../exception    API exception mapping
  src/main/resources             Common and local Spring configuration
  src/test/java                  Spring context, API integration, and error tests
frontend/
  src/app                        Application setup, routes, and theme
  src/domains/auth               Login screen and authentication API
  src/domains/customer-management Customer API, pages, components, forms, and hook
  src/shared                     API client, authentication state, shared UI
  src/layouts                    Authenticated application shell
  src/**/*.test.ts(x)            Tests alongside the related frontend code
.github/workflows/ci.yml         Backend and frontend CI workflow
```

The backend separates HTTP controllers, request/response DTOs, service logic, persistence, and security configuration. The frontend is organized around application setup, feature domains, and shared components/services.

## Configuration and Credentials

- `backend/src/main/resources/application.yml` contains common settings: the application name, the in-memory H2 JDBC URL, disabled JPA open-session-in-view, and session-cookie defaults (`HttpOnly`, `Secure`, and `SameSite=Lax`).
- `backend/src/main/resources/application-local.yml` supplies local/demo security-user properties and relaxes the cookie's `Secure` setting for local HTTP development. This profile is the default for local assessment runs; deployments should explicitly select an appropriate non-local profile.
- The local profile's assessment/demo username and password values have defaults in that file and are deliberately separate from the common configuration. Do not reuse them outside local assessment/demo use. They are not a production credential-management strategy.
- The local values can be overridden with `APP_SECURITY_USER_USERNAME`, `APP_SECURITY_USER_PASSWORD`, `APP_SECURITY_ADMIN_USERNAME`, and `APP_SECURITY_ADMIN_PASSWORD`. Do not place real production secrets in source-controlled configuration.
- The frontend reads `VITE_API_BASE_URL`; if unset, it uses `http://localhost:8080`. The backend CORS configuration currently allows the frontend origin `http://localhost:5173`.

For a production deployment, credentials should come from an appropriate secret-management system, TLS should be used, and the application should use a deliberate production identity and user-management design. The assessment-local defaults and HTTP cookie setting are for local development only.

The demo accounts shown in the quick-start steps are configured in `application-local.yml`. Override them using the environment variables listed above if needed. Both accounts are held in memory by Spring Security for this assessment; they are not persisted application users.

## Security Approach

Spring Security authenticates users through form login and maintains a server-side HTTP session. The two configured users are held in an `InMemoryUserDetailsManager`, one with `USER` and one with `ADMIN` authority. Passwords are encoded with BCrypt when those users are constructed.

CSRF protection is enabled. The frontend first calls the public CSRF endpoint to obtain the token, then sends the returned header name and token on state-changing requests. The session cookie is HTTP-only and uses `SameSite=Lax`; its `Secure` setting is enabled in common configuration and disabled in the local profile to permit local HTTP. CORS allows credentialed requests from the configured local Vite origin.

Customer endpoint authorization is checked by the backend: both roles can list summaries, while only `ADMIN` can create a customer or request an individual customer's details. Frontend role checks only control what controls are shown; callers can bypass the UI, so the server-side checks remain authoritative.

## API Endpoints

All application endpoints are under `/api/v1`.

| Method and path | Purpose | Access |
| --- | --- | --- |
| `GET /api/v1/csrf` | Returns a CSRF token and request-header name for the frontend. | Public |
| `POST /api/v1/login` | Spring Security form login; accepts URL-encoded `username` and `password`. Returns `204` on success and `401` on failure. | Public; CSRF token required |
| `GET /api/v1/auth` | Returns the authenticated username and role for the current session. | Authenticated |
| `POST /api/v1/logout` | Invalidates the current session and deletes its session cookie. Returns `204` on success. | Session endpoint; CSRF token required |
| `GET /api/v1/customers` | Returns a list of customer summaries (`id`, `firstName`, `lastName`), ordered by ID. | `USER` or `ADMIN` |
| `GET /api/v1/customers/{id}` | Returns one customer's details, including `dateOfBirth`; a missing ID returns `404`. | `ADMIN` |
| `POST /api/v1/customers` | Creates a customer from `firstName`, `lastName`, and `dateOfBirth`; returns the created details with `201`. | `ADMIN`; CSRF token required |

The list and detail APIs use two separate backend DTOs to avoid returning fields that the caller does not need:

- `CustomerSummaryResponse` contains only `id`, `firstName`, and `lastName`. It is used by `GET /api/v1/customers` for both roles and intentionally excludes date of birth (PII), so the grid does not receive it.
- `CustomerDetailsResponse` contains `id`, `firstName`, `lastName`, and `dateOfBirth`. It is returned by the admin-only customer detail endpoint and after creation. This keeps date of birth available for authorized detail and management flows without putting it in every list response.

Creation validates non-blank names up to 50 characters and a required date of birth that is not in the future. The backend returns structured error responses for validation and other handled API errors.

## Test and Verification

Run the backend verification (including tests) from the repository root:

```sh
cd backend
./mvnw --batch-mode --no-transfer-progress clean verify
```

Install frontend dependencies once, then run the frontend tests, lint, and production build:

```sh
cd frontend
npm install
npm run test:run
npm run lint
npm run build
```

`npm test` starts Vitest in watch mode; `npm run test:run` is the non-watch command used by CI.

## CI

`.github/workflows/ci.yml` runs on pushes to `feature/customer_management_app` and can also be started with `workflow_dispatch`. It has separate backend and frontend jobs on Ubuntu:

- Backend sets up Temurin Java 21 and runs `./mvnw --batch-mode --no-transfer-progress clean verify`.
- Frontend sets up Node.js 22, runs `npm ci` in CI to install the locked dependencies, then runs frontend tests, ESLint, and the production build.

## Design Decisions and Trade-offs

| Decision | Implemented now | Possible production direction |
| --- | --- | --- |
| H2 in-memory persistence | The application uses `jdbc:h2:mem:customer-management`; data is transient and this keeps the assessment self-contained. | Use a managed persistent database with migrations, backups, and operational controls. |
| Session authentication and in-memory users | Spring Security form login creates server sessions; two configured accounts are loaded in memory. This meets the assessment's limited user-management needs. | Integrate an enterprise identity provider or persistent user/role store, and define session lifecycle and scaling requirements. |
| Summary and detail DTOs | The list returns only ID and names; the admin-only detail endpoint returns date of birth. | Revisit data minimization and authorization with privacy and business requirements as they evolve. |
| Validation at both layers | Zod provides immediate form validation and the API independently validates requests with Jakarta Bean Validation. | Preserve backend validation as authoritative and formalize API contract/schema sharing if client count or complexity grows. |
| Feature-oriented frontend and colocated tests | Authentication and customer-management code are grouped by feature; tests live alongside the code they cover. | Keep this organization while it remains navigable; split shared modules or test suites further only if scale warrants it. |

The grid's filtering and pagination are client-side over the returned customer list; the API currently returns the full list without server-side paging or filtering.

## Known Limitations

- H2 data exists only in memory and is lost when the backend stops.
- Local account defaults are assessment/demo credentials, and authentication/user storage are intentionally simplified.
- The production build currently succeeds but reports generated JavaScript chunks larger than Vite's 500 kB warning threshold. The customer list is lazy-loaded, but the overall bundle can be revisited if its size becomes a user or deployment concern.
- The CORS allow-list is configured for the local frontend origin; other deployment origins require configuration changes.

## Future Enhancements

The items below are future work, not current application functionality.

### 1. Extend CI into a CI/CD workflow

The current GitHub Actions workflow is **CI**, not complete CI/CD: it checks the backend with Maven verification and checks the frontend with tests, lint, and a production build. It does not publish release artifacts, deploy the application, or promote releases between environments. This scope is appropriate for the assessment because no target hosting platform, deployment environment, release process, or deployment credentials are configured in the repository.

A production delivery workflow could add stages after successful CI to package and publish versioned backend/frontend artifacts or container images, deploy to a staging environment, run deployment/smoke checks, and promote an approved release to production. The design would need environment-specific configuration, protected deployment credentials/secrets, approval gates where appropriate, rollback strategy, and a selected hosting platform. These steps should be added only once the deployment target and release requirements are defined.

### 2. Replace local demo accounts with managed authentication and authorization

`application-local.yml` defines two default usernames and passwords so an interviewer can try both implemented roles locally. The `local` profile is separate from common configuration and can be overridden through environment variables; Spring Security loads these accounts in memory and BCrypt-encodes their passwords. This is deliberately small and convenient for a technical assessment, not a secure way to manage production identities, credentials, account lifecycle, or permissions.

With a production identity store such as PostgreSQL, a database-backed design could persist users (for example, user ID, unique username/email, password hash, enabled/locked state), roles, user-role assignments, and—if finer-grained authorization is needed—permissions/entitlements and role-permission assignments. Spring Security could then load the account and authorities through a database-backed `UserDetailsService` or equivalent authentication service. Passwords would remain one-way hashed (for example, BCrypt), never stored in plaintext; account creation, password reset, lockout, deactivation, and auditing would also need explicit policies. Database access credentials and any signing keys would be supplied through production secret management, not committed to application YAML.

The current browser application uses server-side session authentication and CSRF protection, which may remain a suitable choice for a same-origin or appropriately configured web application. An enterprise OpenID Connect (OIDC) identity provider could instead handle sign-in and identity lifecycle. OAuth 2.0/OIDC and JWT are related but not interchangeable: OAuth/OIDC can provide delegated identity/access flows, while signed JWT access tokens can be useful for stateless APIs or service-to-service clients. A token-based approach would require deliberate decisions about token validation, expiry, refresh/revocation, browser storage, and CSRF/XSS risks; it is not automatically preferable to the current session model.

### 3. Move customer data to persistent production storage

The current customer records use H2's in-memory database to keep the assessment self-contained. A stable deployment could use PostgreSQL or another supported relational database, with connection details supplied by environment-specific configuration and secrets. A production migration would include the database driver, schema migrations (for example, with a migration tool), constraints/indexes, backup and restore procedures, connection-pool sizing, and operational monitoring. Customer data would then persist across application restarts, unlike the current H2 in-memory database.

Further application work could add audit logging, server-side pagination/filtering for larger datasets, broader automated security and accessibility testing, monitoring/observability, and deployment infrastructure. Frontend code splitting can also be expanded if measurements show the current bundle warning is material.
