export interface CustomerSummary {
    id: number
    firstName: string
    lastName: string
}

export interface Customer extends CustomerSummary {
    dateOfBirth: string
}

export interface CreateCustomerRequest {
    firstName: string
    lastName: string
    dateOfBirth: string
}