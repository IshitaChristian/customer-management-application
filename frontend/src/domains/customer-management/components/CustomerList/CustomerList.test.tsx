import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CustomerList from './CustomerList'

vi.mock('../../../../shared/components/CustomerAppGrid/CustomerAppGrid', () => ({
    default: () => <div data-testid="customer-app-grid" />,
}))

describe('CustomerList', () => {
    it('shows the empty state and lets the user add a customer', () => {
        const onAddCustomer = vi.fn()

        render(
            <CustomerList
                customers={[]}
                onAddCustomer={onAddCustomer}
                onRefresh={vi.fn()}
            />,
        )

        expect(screen.getByText('No customers yet')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Add Customer' }))
        expect(onAddCustomer).toHaveBeenCalledOnce()
    })
})
