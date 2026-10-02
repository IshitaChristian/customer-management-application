import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/apiError'
import {
    getCurrentUser,
    login,
    logout,
} from '../../domains/auth/api/authService'
import { AuthProvider } from './AuthProvider'
import { AUTHENTICATION_EXPIRED_EVENT } from './authEvents'
import { useAuth } from './useAuth'

vi.mock('../../domains/auth/api/authService', () => ({
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
}))

const mockGetCurrentUser = vi.mocked(getCurrentUser)
const mockLogin = vi.mocked(login)
const mockLogout = vi.mocked(logout)

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('treats an unauthorized session restoration as signed out', async () => {
        mockGetCurrentUser.mockRejectedValue(new ApiError(401, 'Unauthorized'))

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.user).toBeNull()
        expect(result.current.authError).toBeNull()
    })

    it('shows recovery state for unexpected session-check failures', async () => {
        mockGetCurrentUser.mockRejectedValueOnce(new ApiError(503, 'Unavailable'))
            .mockResolvedValueOnce({ username: 'admin', role: 'ADMIN' })

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        })

        await waitFor(() => expect(result.current.authError).not.toBeNull())
        expect(result.current.user).toBeNull()

        act(() => result.current.retryAuthenticationCheck())

        await waitFor(() => {
            expect(result.current.user).toEqual({
                username: 'admin',
                role: 'ADMIN',
            })
            expect(result.current.authError).toBeNull()
        })
        expect(mockGetCurrentUser).toHaveBeenCalledTimes(2)
    })

    it('clears authenticated state after a session-expired event', async () => {
        mockGetCurrentUser.mockResolvedValue({
            username: 'admin',
            role: 'ADMIN',
        })

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        })

        await waitFor(() => expect(result.current.user).not.toBeNull())

        act(() => {
            window.dispatchEvent(new Event(AUTHENTICATION_EXPIRED_EVENT))
        })

        expect(result.current.user).toBeNull()
    })

    it('updates authentication state after login and logout', async () => {
        mockLogin.mockResolvedValue()
        mockLogout.mockResolvedValue()
        mockGetCurrentUser.mockResolvedValue({
            username: 'user',
            role: 'USER',
        })

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        await act(() => result.current.login('user', 'password'))
        expect(result.current.user).toEqual({
            username: 'user',
            role: 'USER',
        })

        await act(() => result.current.logout())
        expect(result.current.user).toBeNull()
        expect(mockLogout).toHaveBeenCalledOnce()
    })
})
