import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../../shared/api/apiError'
import LoginPage from './LoginPage'

const { mockLogin } = vi.hoisted(() => ({
    mockLogin: vi.fn(),
}))

vi.mock('../../../../shared/auth/useAuth', () => ({
    useAuth: () => ({ login: mockLogin }),
}))

function renderLoginPage() {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/customers" element={<div>Customer application</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders required username and password fields', () => {
        renderLoginPage()

        expect(screen.getByRole('textbox', { name: 'Username' })).toBeRequired()
        expect(document.querySelector('input[type="password"]')).toBeRequired()
    })

    it('blocks sign in when username and password are blank', async () => {
        const user = userEvent.setup()
        renderLoginPage()

        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(screen.getByText('Username is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Username' })).toHaveAttribute(
            'aria-invalid',
            'true',
        )
        expect(document.querySelector('input[type="password"]')).toHaveAttribute(
            'aria-invalid',
            'true',
        )
        expect(mockLogin).not.toHaveBeenCalled()
    })

    it('logs in and navigates to customers on successful submission', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue(undefined)
        renderLoginPage()

        await user.type(screen.getByRole('textbox', { name: 'Username' }), 'admin')
        await user.type(document.querySelector('input[type="password"]')!, 'secret')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(await screen.findByText('Customer application')).toBeInTheDocument()
        expect(mockLogin).toHaveBeenCalledWith('admin', 'secret')
    })

    it('shows a useful error and allows another attempt when login fails', async () => {
        const user = userEvent.setup()
        mockLogin.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'))
        renderLoginPage()

        await user.type(screen.getByRole('textbox', { name: 'Username' }), 'admin')
        await user.type(document.querySelector('input[type="password"]')!, 'wrong')
        await user.click(screen.getByRole('button', { name: 'Sign in' }))

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Unable to sign in. Check your username and password.',
        )
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    })

    it('disables submission while login is pending', async () => {
        const user = userEvent.setup()
        let completeLogin: () => void = () => undefined
        mockLogin.mockReturnValue(new Promise<void>((resolve) => {
            completeLogin = resolve
        }))
        renderLoginPage()

        await user.type(screen.getByRole('textbox', { name: 'Username' }), 'admin')
        await user.type(document.querySelector('input[type="password"]')!, 'secret')
        fireEvent.submit(screen.getByRole('textbox', { name: 'Username' }).closest('form')!)

        expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
        completeLogin()
        await waitFor(() => {
            expect(screen.getByText('Customer application')).toBeInTheDocument()
        })
    })
})
