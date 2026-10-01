import {
    render,
    screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CustomerDetails from './CustomerDetails'

const {
    mockNavigate,
    mockGetCustomer,
    mockUseQuery,
} = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockGetCustomer: vi.fn(),
    mockUseQuery: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<
        typeof import('react-router-dom')
    >('react-router-dom')

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            pathname: '/customers/123',
            state: null,
        }),
        useParams: () => ({
            id: '123',
        }),
    }
})

vi.mock('@tanstack/react-query', () => ({
    useQuery: mockUseQuery,
}))

vi.mock('../services/customerApi', () => ({
    getCustomer: mockGetCustomer,
}))

function renderCustomerDetails() {
    return render(
        <MemoryRouter>
            <CustomerDetails />
        </MemoryRouter>,
    )
}

describe('CustomerDetails', () => {
    it('renders customer details', () => {
        mockUseQuery.mockReturnValue({
            data: {
                id: 123,
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: '1990-05-10',
            },
            isLoading: false,
            isError: false,
            error: null,
        })

        renderCustomerDetails()

        expect(
            screen.getByRole('heading', {
                name: 'John Smith',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Customer details'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('First name'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('John'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Last name'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Smith'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Date of birth'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('1990-05-10'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Customer ID'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('123'),
        ).toBeInTheDocument()
    })

    it('shows a loading state while the customer is being fetched', () => {
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        })

        renderCustomerDetails()

        expect(
            screen.getByRole('progressbar'),
        ).toBeInTheDocument()
    })

    it('shows an error state when the customer cannot be found', () => {
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error(
                'Customer could not be found.',
            ),
        })

        renderCustomerDetails()

        expect(
            screen.getByRole('heading', {
                name: 'Customer not found',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Customer could not be found.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Back to customers',
            }),
        ).toBeInTheDocument()
    })

    it('navigates back to customers', async () => {
        const user = await import(
            '@testing-library/user-event'
            )

        mockUseQuery.mockReturnValue({
            data: {
                id: 123,
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: '1990-05-10',
            },
            isLoading: false,
            isError: false,
            error: null,
        })

        const userEvent = user.default.setup()

        renderCustomerDetails()

        await userEvent.click(
            screen.getByRole('button', {
                name: 'Back to customers',
            }),
        )

        expect(mockNavigate).toHaveBeenCalledWith(
            '/customers',
        )
    })
})