import { render, screen } from '@testing-library/react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomersPage from './CustomersPage'

const { mockMutation, mockUseCustomers } = vi.hoisted(() => ({
  mockMutation: {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  },
  mockUseCustomers: vi.fn(),
}))

vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: mockUseCustomers,
  useCreateCustomer: () => mockMutation,
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
    mockUseCustomers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
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
})
