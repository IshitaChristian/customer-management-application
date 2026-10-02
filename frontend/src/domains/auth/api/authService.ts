import apiClient from '../../../shared/api/apiClient'

export type UserRole = 'USER' | 'ADMIN'

export interface AuthenticatedUser {
    username: string
    role: UserRole
}

/** Establishes the server session using Spring Security's form-login endpoint. */
export async function login(username: string, password: string): Promise<void> {
    const body = new URLSearchParams({ username, password })
    await apiClient.post('/api/v1/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
}

/** Invalidates the current server session. */
export async function logout(): Promise<void> {
    await apiClient.post('/api/v1/logout')
}

/** Restores the current user's identity and role from the active session. */
export async function getCurrentUser(): Promise<AuthenticatedUser> {
    const response = await apiClient.get<AuthenticatedUser>('/api/v1/auth')
    return response.data
}
