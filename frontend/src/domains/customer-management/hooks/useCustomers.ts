import { useCallback, useEffect, useState } from 'react'
import { getCustomers } from '../api/customerApi'
import type { CustomerSummary } from '../types/customer'

async function getCustomersWithRetry(signal: AbortSignal) {
  try {
    return await getCustomers(signal)
  } catch (requestError: unknown) {
    if (signal.aborted) {
      throw requestError
    }

    return getCustomers(signal)
  }
}

export function useCustomers() {
  const [data, setData] = useState<CustomerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getCustomersWithRetry(controller.signal)
      .then((customers) => {
        setData(customers)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(requestError)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [reloadKey])

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    refetch,
  }
}