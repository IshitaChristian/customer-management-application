import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddCustomerDialog from './AddCustomerDialog'

const { mockCreateCustomer } = vi.hoisted(() => ({
  mockCreateCustomer: vi.fn(),
}))

vi.mock('../../api/customerApi', () => ({
  createCustomer: mockCreateCustomer,
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
    mockCreateCustomer.mockResolvedValue({})
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

  it('validates required fields and the backend name-length limit', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Last name is required')).toBeInTheDocument()
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument()
    expect(mockCreateCustomer).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('First name'), 'J'.repeat(51))
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(
      screen.getByText('First name must be 50 characters or fewer'),
    ).toBeInTheDocument()
    expect(mockCreateCustomer).not.toHaveBeenCalled()
  })

  it('accepts names outside the Latin alphabet', async () => {
    const user = userEvent.setup()
    const { onCreated } = renderDialog()
    await user.type(screen.getByLabelText('First name'), '李')
    await user.type(screen.getByLabelText('Last name'), '王')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalledWith({
        firstName: '李',
        lastName: '王',
        dateOfBirth: '1990-05-10',
      })
    })
    expect(onCreated).toHaveBeenCalledOnce()
  })

  it.each([
    ['First name', 'Jane1'],
    ['First name', 'Jane!'],
    ['Last name', 'Doe2'],
    ['Last name', 'Doe@'],
  ])('rejects numbers and punctuation in %s', async (label, value) => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText(label), value)
    await user.click(screen.getByRole('button', { name: 'Add customer' }))

    expect(
      screen.getByText(
        `${label} can only contain letters, spaces, apostrophes, and hyphens`,
      ),
    ).toBeInTheDocument()
    expect(mockCreateCustomer).not.toHaveBeenCalled()
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
    expect(mockCreateCustomer).not.toHaveBeenCalled()
  })

  it('submits valid details and reports successful creation', async () => {
    const user = userEvent.setup()
    const { onClose, onCreated } = renderDialog()
    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-05-10',
      })
    })
    expect(onCreated).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows API errors without closing the dialog', async () => {
    const user = userEvent.setup()
    mockCreateCustomer.mockRejectedValueOnce(
      new Error('Unable to save customer.'),
    )
    const { onClose } = renderDialog()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to save customer.',
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('prevents closing while the customer is being submitted', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mockCreateCustomer.mockReturnValue(
      new Promise(() => {}),
    )
    renderDialog({ onClose })

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '1990-05-10' },
    })
    await user.click(
      screen.getByRole('button', { name: 'Add customer' }),
    )

    expect(
      screen.getByRole('button', { name: 'Cancel' }),
    ).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })
})
