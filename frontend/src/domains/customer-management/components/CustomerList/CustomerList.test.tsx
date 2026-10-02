import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CustomerList from './CustomerList'

vi.mock('../../../../shared/components/CustomerAppGrid/CustomerAppGrid', () => ({
    default: ({ columnDefs }: {
        columnDefs: { headerName?: string }[]
    }) => (
        <div data-testid="customer-app-grid">
            {columnDefs.map((column) => (
                <span key={column.headerName}>{column.headerName}</span>
            ))}
        </div>
    ),
}))

describe('CustomerList', () => {
    it('shows the empty state and lets the user add a customer', () => {
        const onAddCustomer = vi.fn()

        render(
            <CustomerList
                customers={[]}
                onAddCustomer={onAddCustomer}
                onRefresh={vi.fn()}
                canManageCustomers
            />,
        )

        expect(screen.getByText('No customers yet')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Add Customer' }))
        expect(onAddCustomer).toHaveBeenCalledOnce()
    })

    it.each(['USER', 'ADMIN'] as const)(
        'hides date of birth from the %s customer list',
        (role) => {
        render(
            <CustomerList
                customers={[{
                    id: 1,
                    firstName: 'Ada',
                    lastName: 'Lovelace',
                }]}
                onAddCustomer={vi.fn()}
                onRefresh={vi.fn()}
                canManageCustomers={role === 'ADMIN'}
            />,
        )

        expect(screen.getByText('First name')).toBeInTheDocument()
        expect(screen.getByText('Last name')).toBeInTheDocument()
        expect(screen.queryByText('Date of birth')).not.toBeInTheDocument()
        expect(Boolean(screen.queryByText('Actions'))).toBe(role === 'ADMIN')
        },
    )
})
