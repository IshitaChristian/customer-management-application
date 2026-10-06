import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomerDetailsDialog from './CustomerDetailsDialog'

const { mockGetCustomerById } = vi.hoisted(() => ({
    mockGetCustomerById: vi.fn(),
}))

vi.mock('../../api/customerApi', () => ({
    getCustomerById: mockGetCustomerById,
}))

describe('CustomerDetailsDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetCustomerById.mockResolvedValue({
            id: 1,
            firstName: 'Ada',
            lastName: 'Lovelace',
            dateOfBirth: '1815-12-10',
        })
    })

    it('loads and displays the selected customer details', async () => {
        render(
            <CustomerDetailsDialog
                customerId={1}
                onClose={vi.fn()}
            />,
        )

        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
        expect(screen.getByText('1815-12-10')).toBeInTheDocument()
        expect(screen.getByText('ID')).toBeInTheDocument()
    })

    it('shows a loading indicator while customer details load', () => {
        mockGetCustomerById.mockReturnValue(new Promise(() => {}))

        render(
            <CustomerDetailsDialog
                customerId={1}
                onClose={vi.fn()}
            />,
        )

        expect(screen.getByLabelText('Loading customer details'))
            .toBeInTheDocument()
    })

    it('shows an error when the detail request fails', async () => {
        mockGetCustomerById.mockRejectedValue(new Error('Unable to load details'))

        render(
            <CustomerDetailsDialog
                customerId={1}
                onClose={vi.fn()}
            />,
        )

        expect(await screen.findByText('Unable to load details'))
            .toBeInTheDocument()
    })

    it('closes from the close icon', async () => {
        const onClose = vi.fn()
        const user = userEvent.setup()

        render(
            <CustomerDetailsDialog
                customerId={1}
                onClose={onClose}
            />,
        )

        await user.click(screen.getByRole('button', {
            name: 'Close customer details',
        }))

        expect(onClose).toHaveBeenCalledOnce()
    })
})
