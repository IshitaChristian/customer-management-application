import {
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import FindCustomer from './FindCustomer'

const {
    mockNavigate,
    mockGetCustomer,
} = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockGetCustomer: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<
        typeof import('react-router-dom')
    >('react-router-dom')

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('../services/customerApi', () => ({
    getCustomer: mockGetCustomer,
}))

function renderFindCustomer() {
    return render(
        <MemoryRouter>
            <FindCustomer />
        </MemoryRouter>,
    )
}

describe('FindCustomer', () => {
    it('renders the find customer form', () => {
        renderFindCustomer()

        expect(
            screen.getByRole('heading', {
                name: 'Find customer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Customer ID'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Find customer',
            }),
        ).toBeInTheDocument()
    })

    it('shows an error for an invalid customer ID', async () => {
        const user = userEvent.setup()

        renderFindCustomer()

        await user.type(
            screen.getByLabelText('Customer ID'),
            '0',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Find customer',
            }),
        )

        expect(
            screen.getByText(
                'Please enter a valid customer ID.',
            ),
        ).toBeInTheDocument()

        expect(mockGetCustomer).not.toHaveBeenCalled()
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('navigates to the customer details page when a customer is found', async () => {
        const user = userEvent.setup()

        mockGetCustomer.mockResolvedValueOnce({
            id: 123,
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: '1990-05-10',
        })

        renderFindCustomer()

        await user.type(
            screen.getByLabelText('Customer ID'),
            '123',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Find customer',
            }),
        )

        await waitFor(() => {
            expect(mockGetCustomer).toHaveBeenCalledWith(123)
        })

        expect(mockNavigate).toHaveBeenCalledWith(
            '/customers/123',
        )
    })

    it('shows an error when the customer is not found', async () => {
        const user = userEvent.setup()

        mockGetCustomer.mockRejectedValueOnce(
            new Error('Customer could not be found.'),
        )

        renderFindCustomer()

        await user.type(
            screen.getByLabelText('Customer ID'),
            '999',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Find customer',
            }),
        )

        expect(
            await screen.findByText(
                'Customer with ID 999 was not found. Please enter a valid customer ID.',
            ),
        ).toBeInTheDocument()

        expect(mockGetCustomer).toHaveBeenCalledWith(999)
        expect(mockNavigate).not.toHaveBeenCalled()
    })
})