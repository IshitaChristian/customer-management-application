import { fireEvent, render, screen } from '@testing-library/react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomersPage from './CustomersPage'

const {
  mockUseCustomers,
  mockRefetch,
  mockCreateCustomer,
  mockUseAuth,
} = vi.hoisted(() => ({
  mockUseCustomers: vi.fn(),
  mockRefetch: vi.fn(),
  mockCreateCustomer: vi.fn(),
  mockUseAuth: vi.fn(),
}))

vi.mock('../../components/CustomerList/CustomerList', () => ({
  default: ({ customers, onAddCustomer, canManageCustomers }: {
    customers: unknown[]
    onAddCustomer: () => void
    canManageCustomers: boolean
  }) => (
    <div data-testid="customer-list">
      {customers.length === 0 && canManageCustomers && (
        <button onClick={onAddCustomer}>Add Customer</button>
      )}
    </div>
  ),
}))

vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: mockUseCustomers,
}))

vi.mock('../../api/customerApi', () => ({
  createCustomer: mockCreateCustomer,
}))

vi.mock('../../../../shared/auth/AuthProvider', () => ({
  useAuth: mockUseAuth,
}))

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: Date | null
    onChange: (value: Date | null) => void
  }) => (
    <input
      aria-label={label}
      value={value ? value.toISOString().slice(0, 10) : ''}
      onChange={(event) => {
        const inputValue = event.target.value
        onChange(
          inputValue ? new Date(`${inputValue}T00:00:00`) : null,
        )
      }}
    />
  ),
}))

function renderCustomersPage() {
  return render(
    <MemoryRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CustomersPage />
      </LocalizationProvider>
    </MemoryRouter>,
  )
}

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateCustomer.mockResolvedValue({})
    mockUseAuth.mockReturnValue({
      user: { username: 'admin', role: 'ADMIN' },
    })
    mockUseCustomers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    })
  })

  it('opens the add-customer dialog from the page action', async () => {
    const user = userEvent.setup()
    renderCustomersPage()

    await user.click(
      screen.getAllByRole('button', { name: 'Add Customer' })[0],
    )

    expect(
      screen.getByRole('dialog', { name: 'Add customer' }),
    ).toBeInTheDocument()
  })

  it('opens the add-customer dialog from the empty state', async () => {
    const user = userEvent.setup()
    renderCustomersPage()

    await user.click(
      screen.getAllByRole('button', { name: 'Add Customer' })[1],
    )

    expect(
      screen.getByRole('dialog', { name: 'Add customer' }),
    ).toBeInTheDocument()
  })

  it('renders the customer list for customer records', async () => {
    mockUseCustomers.mockReturnValue({
      data: [
        {
          id: 1,
          firstName: 'Ada',
          lastName: 'Lovelace',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    })

    renderCustomersPage()

    expect(
      await screen.findByTestId('customer-list'),
    ).toBeInTheDocument()
  })

  it('hides add-customer actions for a USER', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'user', role: 'USER' },
    })
    renderCustomersPage()

    expect(
      screen.queryByRole('button', { name: 'Add Customer' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Add customer' }))
      .not.toBeInTheDocument()
  })

  it('refreshes customers after creating a customer', async () => {
    const user = userEvent.setup()
    renderCustomersPage()
    await user.click(
      screen.getAllByRole('button', { name: 'Add Customer' })[0],
    )
    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(await screen.findByText('Customer added successfully.'))
      .toBeInTheDocument()
    expect(mockRefetch).toHaveBeenCalledOnce()
  })
})
