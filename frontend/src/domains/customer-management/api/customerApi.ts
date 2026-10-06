import apiClient from '../../../shared/api/apiClient'
import type {
  CreateCustomerRequest,
  Customer,
  CustomerSummary,
} from '../types/customer'

const CUSTOMER_ENDPOINT = '/api/v1/customers'

/** Loads list-safe summaries without fetching customers' dates of birth. */
export async function getCustomers(
    signal?: AbortSignal,
): Promise<CustomerSummary[]> {
  const response = await apiClient.get<CustomerSummary[]>(
    CUSTOMER_ENDPOINT,
    { signal },
  )

  return response.data
}

/** Fetches full details on demand for the selected customer. */
export async function getCustomerById(
    id: number,
    signal?: AbortSignal,
): Promise<Customer> {
    const response = await apiClient.get<Customer>(
        `${CUSTOMER_ENDPOINT}/${id}`,
        { signal },
    )

    return response.data
}

/** Creates a customer using the backend's validated request contract. */
export async function createCustomer(
    data: CreateCustomerRequest,
): Promise<Customer> {
    const response = await apiClient.post<Customer>(
        CUSTOMER_ENDPOINT,
        data,
    )

    return response.data
}