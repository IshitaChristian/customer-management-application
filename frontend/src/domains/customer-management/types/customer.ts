export interface Customer {
    id: number
    firstName: string
    lastName: string
    dateOfBirth: string
}

export interface CreateCustomerRequest {
    firstName: string
    lastName: string
    dateOfBirth: string
}