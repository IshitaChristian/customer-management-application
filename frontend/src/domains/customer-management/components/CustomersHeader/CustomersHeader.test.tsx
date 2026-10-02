import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CustomersHeader from './CustomersHeader'

describe('CustomersHeader', () => {
    it('renders page heading, customer count, and add action', () => {
        const onAddCustomer = vi.fn()

        render(
            <CustomersHeader
                customerCount={12}
                onAddCustomer={onAddCustomer}
                canManageCustomers
            />,
        )

        expect(
            screen.getByRole('heading', { name: 'Customers' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Manage your customer records in one place.'))
            .toBeInTheDocument()
        expect(screen.getByText('Total number of customers')).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Add Customer' }))
        expect(onAddCustomer).toHaveBeenCalledOnce()
    })

    it('hides the add action when the user cannot manage customers', () => {
        render(
            <CustomersHeader
                customerCount={1}
                onAddCustomer={vi.fn()}
                canManageCustomers={false}
            />,
        )

        expect(
            screen.queryByRole('button', { name: 'Add Customer' }),
        ).not.toBeInTheDocument()
    })
})
