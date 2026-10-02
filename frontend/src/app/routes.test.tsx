import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../shared/auth/AuthProvider'
import AppRoutes from './routes'

const { mockGetCurrentUser, mockLogin, mockLogout } = vi.hoisted(() => ({
    mockGetCurrentUser: vi.fn(),
    mockLogin: vi.fn(),
    mockLogout: vi.fn(),
}))

vi.mock('../shared/auth/authService', () => ({
    getCurrentUser: mockGetCurrentUser,
    login: mockLogin,
    logout: mockLogout,
}))

vi.mock('../layouts/AppShell', () => ({
    default: () => <Outlet />,
}))

vi.mock('../domains/customer-management/pages/CustomersPage/CustomersPage', () => ({
    default: () => <div>Customer application</div>,
}))

function renderRoutes() {
    return render(
        <MemoryRouter initialEntries={['/customers']}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </MemoryRouter>,
    )
}

describe('AppRoutes authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('does not render the customer application before authentication resolves', async () => {
        let resolveCurrentUser: (value: { username: string; role: 'ADMIN' }) => void =
            () => undefined
        mockGetCurrentUser.mockReturnValue(new Promise((resolve) => {
            resolveCurrentUser = resolve
        }))

        renderRoutes()
        expect(screen.getByLabelText('Checking authentication')).toBeInTheDocument()
        expect(screen.queryByText('Customer application')).not.toBeInTheDocument()

        resolveCurrentUser({ username: 'admin', role: 'ADMIN' })
        expect(await screen.findByText('Customer application')).toBeInTheDocument()
    })

    it('shows login on an unauthenticated startup and navigates after login', async () => {
        const user = userEvent.setup()
        mockGetCurrentUser
            .mockRejectedValueOnce(new Error('Unauthorized'))
            .mockResolvedValueOnce({ username: 'admin', role: 'ADMIN' })
        mockLogin.mockResolvedValue(undefined)

        renderRoutes()
        await user.type(await screen.findByRole('textbox'), 'admin')
        await user.type(document.querySelector('input[type="password"]')!, 'password')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        await waitFor(() => {
            expect(screen.getByText('Customer application')).toBeInTheDocument()
        })
        expect(mockLogin).toHaveBeenCalledWith('admin', 'password')
    })
})
