import { render, screen } from '@testing-library/react'
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
    it('shows the admin empty state without a duplicate add action', () => {
        render(
            <CustomerList
                customers={[]}
                onRefresh={vi.fn()}
                canManageCustomers
            />,
        )

        expect(screen.getByText('No customers yet')).toBeInTheDocument()
        expect(screen.getByText('Add your first customer to get started.'))
            .toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Add Customer' }))
            .not.toBeInTheDocument()
    })

    it('shows the user empty state without an add action', () => {
        render(
            <CustomerList
                customers={[]}
                onRefresh={vi.fn()}
                canManageCustomers={false}
            />,
        )

        expect(screen.getByText('No customers yet')).toBeInTheDocument()
        expect(screen.getByText('There are currently no customers to display.'))
            .toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Add Customer' }))
            .not.toBeInTheDocument()
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
