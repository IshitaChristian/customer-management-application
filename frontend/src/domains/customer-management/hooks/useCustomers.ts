import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createCustomer,
  getCustomers,
} from '../api/customerApi'

export const customerKeys = {
  all: ['customers'] as const,
  list: () => [...customerKeys.all, 'list'] as const,
}

export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.list(),
    queryFn: getCustomers,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.list(),
      })
    },
  })
}