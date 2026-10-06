# AI Usage

## AI Tools Used

* I used **GitHub Copilot** as a development assistant throughout the project.

## Tasks Delegated to AI vs. Developer-Written Work

* I used Copilot to explore implementation options, review code and configuration, suggest test scenarios, review exception and error handling, and help draft documentation.
* Copilot also assisted with repetitive refactoring, naming changes, and code comments/Javadocs.
* I made the architecture, technology, API, authentication, and authorization decisions, and owned the implementation, integration, debugging, and final review.
* In particular, I decided that the customer list should omit date of birth and that access to the customer detail response should be limited to administrators.

## Validation of AI-Generated Code

* I reviewed suggestions against the assessment requirements and the existing implementation before accepting or adapting them.
* I ran backend Maven verification, frontend tests, lint, and the production build, and manually exercised the application.
* The backend tests cover role access, CSRF, sessions, customer validation, missing records, and API errors; frontend tests cover authentication and customer UI behaviour.
* AI suggestions were therefore treated as proposals and were validated through code review, automated tests, and manual testing.

## Examples of Corrected or Rejected AI Suggestions

* I rejected adding a separate data-fetching library such as React Query/TanStack Query; the existing Axios client and focused customer hook were sufficient for the application's current API needs.
* Some AI suggestions introduced unnecessary frontend imports or dependencies. These were reviewed and removed when they were not required.
* I asked for the customer list to use AG Grid and reviewed the integration to ensure it used customer-summary data and kept date of birth out of grid rows.
* Where AI-generated implementations introduced unnecessary complexity, I simplified or adapted them to better fit the application's scope and existing architecture.

## Approximate Time Breakdown With and Without AI Assistance

I did not track hours, so this is a qualitative comparison rather than a measured percentage.

| Activity                       | Without AI                                   | With AI                                                        |
| ------------------------------ | -------------------------------------------- | -------------------------------------------------------------- |
| Architecture and design        | Manual research and decision-making          | AI used to explore alternatives; final decisions remained mine |
| Implementation                 | Full manual implementation effort            | AI assisted with suggestions and repetitive coding/refactoring |
| Testing and debugging          | Manual test-case discovery and investigation | AI helped identify edge cases and test scenarios               |
| Code review and error handling | Manual review                                | AI provided additional review points and alternatives          |
| Documentation                  | Manual drafting                              | AI reduced drafting and refinement effort                      |

The core implementation, integration, debugging, and validation work would still have been required without AI. AI mainly reduced time spent on investigation, repetitive tasks, test planning, review, and documentation.

## Impact of AI on Development

* Copilot helped me consider additional edge cases and review tests, code, exception handling, and documentation.
* It reduced some repetitive implementation and documentation effort and provided alternative approaches during development.
* Some suggestions were unnecessary or added complexity, which required developer review and correction.
* I retained responsibility for correctness, security trade-offs, architecture, and all final decisions.

AI assistance supplemented my development process; it did not replace developer ownership of the final implementation.
