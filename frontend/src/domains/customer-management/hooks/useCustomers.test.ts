import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCustomers } from '../api/customerApi'
import { useCustomers } from './useCustomers'

vi.mock('../api/customerApi', () => ({
    getCustomers: vi.fn(),
}))

const mockGetCustomers = vi.mocked(getCustomers)

describe('useCustomers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('loads customer data and refreshes it when requested', async () => {
        const firstResponse = [
            {
                id: 1,
                firstName: 'Ada',
                lastName: 'Lovelace',
                dateOfBirth: '1815-12-10',
            },
        ]
        const refreshedResponse = [
            ...firstResponse,
            {
                id: 2,
                firstName: 'Grace',
                lastName: 'Hopper',
                dateOfBirth: '1906-12-09',
            },
        ]
        mockGetCustomers
            .mockResolvedValueOnce(firstResponse)
            .mockResolvedValueOnce(refreshedResponse)

        const { result } = renderHook(() => useCustomers())

        expect(result.current.isLoading).toBe(true)
        await waitFor(() => {
            expect(result.current.data).toEqual(firstResponse)
            expect(result.current.isLoading).toBe(false)
        })

        act(() => result.current.refetch())
        await waitFor(() => {
            expect(result.current.data).toEqual(refreshedResponse)
        })
        expect(mockGetCustomers).toHaveBeenCalledTimes(2)
    })

    it('exposes request errors and recovers on retry', async () => {
        const requestError = new Error('Unable to load customers.')
        mockGetCustomers
            .mockRejectedValueOnce(requestError)
            .mockRejectedValueOnce(requestError)
            .mockResolvedValueOnce([])

        const { result } = renderHook(() => useCustomers())

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
            expect(result.current.error).toBe(requestError)
            expect(result.current.isLoading).toBe(false)
        })

        act(() => result.current.refetch())
        await waitFor(() => {
            expect(result.current.isError).toBe(false)
            expect(result.current.error).toBeNull()
        })
        expect(mockGetCustomers).toHaveBeenCalledTimes(3)
    })
})
