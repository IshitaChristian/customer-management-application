import apiClient from '../api/apiClient'

export type UserRole = 'USER' | 'ADMIN'

export interface AuthenticatedUser {
    username: string
    role: UserRole
}

export async function login(username: string, password: string): Promise<void> {
    const body = new URLSearchParams({ username, password })
    await apiClient.post('/api/v1/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
}

export async function logout(): Promise<void> {
    await apiClient.post('/api/v1/logout')
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
    const response = await apiClient.get<AuthenticatedUser>('/api/v1/auth/me')
    return response.data
}
