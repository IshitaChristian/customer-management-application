import apiClient from '../../../shared/api/apiClient'
import type {
  CreateCustomerRequest,
  Customer,
} from '../types/customer'

const CUSTOMER_ENDPOINT = '/api/v1/customers'

export async function getCustomers(
    signal?: AbortSignal,
): Promise<Customer[]> {
  const response = await apiClient.get<Customer[]>(
    CUSTOMER_ENDPOINT,
    { signal },
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