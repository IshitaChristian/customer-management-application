import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    MemoryRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppShell from './AppShell'

const { mockLogout } = vi.hoisted(() => ({
    mockLogout: vi.fn(),
}))

vi.mock('../shared/auth/AuthProvider', () => ({
    useAuth: () => ({
        user: { username: 'admin-user', role: 'ADMIN' },
        logout: mockLogout,
    }),
}))

function renderAppShell() {
    return render(
        <MemoryRouter initialEntries={['/customers']}>
            <Routes>
                <Route element={<AppShell />}>
                    <Route path="/" element={<Navigate to="/customers" replace />} />
                    <Route path="/customers" element={<div>Customer page</div>} />
                </Route>
                <Route path="/login" element={<div>Login page</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe('AppShell', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLogout.mockResolvedValue(undefined)
    })

    it('renders the authenticated username and role', () => {
        renderAppShell()

        expect(screen.getByText('admin-user (ADMIN)')).toBeInTheDocument()
    })

    it('renders and follows the customer navigation', async () => {
        const user = userEvent.setup()
        renderAppShell()

        const customersLink = screen.getByRole('link', { name: 'Customers' })
        expect(customersLink).toHaveAttribute('href', '/')
        expect(screen.getByText('Customer page')).toBeInTheDocument()
        await user.click(customersLink)
        expect(screen.getByText('Customer page')).toBeInTheDocument()
    })

    it('logs out and navigates to the login page', async () => {
        const user = userEvent.setup()
        renderAppShell()

        await user.click(screen.getByRole('button', { name: 'Log out' }))

        expect(mockLogout).toHaveBeenCalledOnce()
        expect(await screen.findByText('Login page')).toBeInTheDocument()
    })
})
