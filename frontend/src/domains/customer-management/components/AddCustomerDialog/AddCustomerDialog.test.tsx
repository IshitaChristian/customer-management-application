import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddCustomerDialog from './AddCustomerDialog'

const {
  mockMutate,
  mockResetMutation,
  mockUseCreateCustomer,
} = vi.hoisted(() => ({
  mockMutate: vi.fn(),
  mockResetMutation: vi.fn(),
  mockUseCreateCustomer: vi.fn(),
}))

vi.mock('../../hooks/useCustomers', () => ({
  useCreateCustomer: mockUseCreateCustomer,
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
        value={value ? value.toISOString().slice(0, 10) : ''}
        onChange={(event) => {
          const inputValue = event.target.value
          onChange(
            inputValue
              ? new Date(`${inputValue}T00:00:00`)
              : null,
          )
        }}
        aria-invalid={slotProps?.textField?.error ? 'true' : 'false'}
      />
      {slotProps?.textField?.helperText && (
        <span>{slotProps.textField.helperText}</span>
      )}
    </div>
  ),
}))

function renderDialog({
  onClose = vi.fn(),
  onCreated = vi.fn(),
}: {
  onClose?: () => void
  onCreated?: () => void
} = {}) {
  render(
    <AddCustomerDialog
      open
      onClose={onClose}
      onCreated={onCreated}
    />,
  )

  return { onClose, onCreated }
}

describe('AddCustomerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateCustomer.mockReturnValue({
      mutate: mockMutate,
      reset: mockResetMutation,
      isPending: false,
      isError: false,
      error: null,
    })
  })

  it('renders an accessible customer form dialog', () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Add customer' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Date of birth')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add customer' }),
    ).toBeInTheDocument()
  })

  it('closes from Cancel and Escape', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('validates required fields and invalid names before submitting', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(mockMutate).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('First name'), 'Jane123')
    await user.type(screen.getByLabelText('Last name'), 'Doe123')
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(
      screen.getByText('Please provide a valid first name'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Please provide a valid last name'),
    ).toBeInTheDocument()
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('rejects a future date of birth', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '2099-01-01' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(
      screen.getByText('Please provide a valid date of birth'),
    ).toBeInTheDocument()
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('submits valid details and reports successful creation', async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderDialog()
    mockMutate.mockImplementationOnce(
      (
        _values: {
          firstName: string
          lastName: string
          dateOfBirth: string
        },
        options?: { onSuccess?: () => void },
      ) => options?.onSuccess?.(),
    )

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: '1990-05-10',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      )
    })
    expect(onCreated).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows API errors without closing the dialog', async () => {
    mockUseCreateCustomer.mockReturnValue({
      mutate: mockMutate,
      reset: mockResetMutation,
      isPending: false,
      isError: true,
      error: new Error('Unable to save customer.'),
    })
    const { onClose } = renderDialog()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to save customer.',
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('prevents closing while the customer is being submitted', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mockUseCreateCustomer.mockReturnValue({
      mutate: mockMutate,
      reset: mockResetMutation,
      isPending: true,
      isError: false,
      error: null,
    })
    renderDialog({ onClose })

    expect(
      screen.getByRole('button', { name: 'Cancel' }),
    ).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })
})
