import apiClient from '../../../services/apiClient'
import type {
  CreateCustomerRequest,
  Customer,
} from '../types/customer'

const CUSTOMER_ENDPOINT = '/api/v1/customers'

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiClient.get<Customer[]>(
    CUSTOMER_ENDPOINT,
  )

  return response.data
}

export async function getCustomer(id: number): Promise<Customer> {
  const response = await apiClient.get<Customer>(
    `${CUSTOMER_ENDPOINT}/${id}`,
)

return response.data
}

export async function createCustomer(
    data: CreateCustomerRequest,
): Promise<Customer> {
    const response = await apiClient.post<Customer>(
        CUSTOMER_ENDPOINT,
        data,
    )

    return response.data
}