import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AddCustomer from './AddCustomer'

const mockNavigate = vi.fn()
const mockMutate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<
        typeof import('react-router-dom')
    >('react-router-dom')

    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('../hooks/useCustomers', () => ({
    useCreateCustomer: () => ({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
    }),
}))

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
    DatePicker: ({
                     label,
                     value,
                     onChange,
                     slotProps,
                 }: {
        label: string
        value: Date | null
        onChange: (value: Date | null) => void
        slotProps?: {
            textField?: {
                error?: boolean
                helperText?: string
            }
        }
    }) => (
        <div>
            <input
                aria-label={label}
                value={
                    value
                        ? value.toISOString().slice(0, 10)
                        : ''
                }
                onChange={(event) => {
                    const inputValue = event.target.value

                    onChange(
                        inputValue
                            ? new Date(`${inputValue}T00:00:00`)
                            : null,
                    )
                }}
                aria-invalid={
                    slotProps?.textField?.error
                        ? 'true'
                        : 'false'
                }
            />

            {slotProps?.textField?.helperText && (
                <span>
          {slotProps.textField.helperText}
        </span>
            )}
        </div>
    ),
}))

function renderAddCustomer() {
    return render(
        <MemoryRouter>
            <AddCustomer />
        </MemoryRouter>,
    )
}

describe('AddCustomer', () => {
    it('renders the customer form', () => {
        renderAddCustomer()

        expect(
            screen.getByRole('heading', {
                name: 'Add new customer.',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('First name'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Last name'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Date of birth'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Add Customer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Cancel',
            }),
        ).toBeInTheDocument()
    })

    it('shows validation errors when required fields are missing', async () => {
        const user = userEvent.setup()

        renderAddCustomer()

        await user.click(
            screen.getByRole('button', {
                name: 'Add Customer',
            }),
        )

        expect(
            screen.getByText('First name is required'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Last name is required'),
        ).toBeInTheDocument()

        const dateOfBirthInput =
            screen.getByLabelText('Date of birth')

        expect(dateOfBirthInput).toHaveAttribute(
            'aria-invalid',
            'true',
        )

        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('shows validation errors for invalid names', async () => {
        const user = userEvent.setup()

        renderAddCustomer()

        await user.type(
            screen.getByLabelText('First name'),
            'John123',
        )

        await user.type(
            screen.getByLabelText('Last name'),
            'Smith123',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Add Customer',
            }),
        )

        expect(
            screen.getByText(
                'Please provide a valid first name',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Please provide a valid last name',
            ),
        ).toBeInTheDocument()

        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('rejects a future date of birth', async () => {
        const user = userEvent.setup()

        renderAddCustomer()

        await user.type(
            screen.getByLabelText('First name'),
            'John',
        )

        await user.type(
            screen.getByLabelText('Last name'),
            'Smith',
        )

        fireEvent.change(
            screen.getByLabelText('Date of birth'),
            {
                target: {
                    value: '2099-01-01',
                },
            },
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Add Customer',
            }),
        )

        expect(
            screen.getByLabelText('Date of birth'),
        ).toHaveAttribute(
            'aria-invalid',
            'true',
        )

        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('submits a valid customer', async () => {
        const user = userEvent.setup()

        mockMutate.mockImplementation(
            (
                _values: {
                    firstName: string
                    lastName: string
                    dateOfBirth: string
                },
                options?: {
                    onSuccess?: (customer: {
                        id: number
                    }) => void
                },
            ) => {
                options?.onSuccess?.({
                    id: 123,
                })

                return undefined
            },
        )

        renderAddCustomer()

        await user.type(
            screen.getByLabelText('First name'),
            'John',
        )

        await user.type(
            screen.getByLabelText('Last name'),
            'Smith',
        )

        fireEvent.change(
            screen.getByLabelText('Date of birth'),
            {
                target: {
                    value: '1990-05-10',
                },
            },
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Add Customer',
            }),
        )

        expect(mockMutate).toHaveBeenCalledWith(
            {
                firstName: 'John',
                lastName: 'Smith',
                dateOfBirth: '1990-05-10',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        )

        expect(mockNavigate).toHaveBeenCalledWith(
            '/customers/123',
            expect.objectContaining({
                state: expect.objectContaining({
                    successMessage:
                        'Customer added successfully.',
                }),
            }),
        )
    })
})