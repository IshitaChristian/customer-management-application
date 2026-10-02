import { Close } from '@mui/icons-material'
import {
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getCustomerById } from '../../api/customerApi'
import type { Customer } from '../../types/customer'

interface CustomerDetailsDialogProps {
    customerId: number
    onClose: () => void
}

function CustomerDetailsDialog({
    customerId,
    onClose,
}: CustomerDetailsDialogProps) {
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        getCustomerById(customerId, controller.signal)
            .then(setCustomer)
            .catch((requestError: unknown) => {
                if (!controller.signal.aborted) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'Unable to load customer details.',
                    )
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            })

        return () => controller.abort()
    }, [customerId])

    const details = customer
        ? [
            { label: 'ID', value: customer.id },
            {
                label: 'Name',
                value: `${customer.firstName} ${customer.lastName}`,
            },
            {
                label: 'Date of birth',
                value: customer.dateOfBirth,
            },
        ]
        : []

    return (
        <Dialog
            open
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pr: 1.5,
                }}
            >
                Customer Details
                <IconButton
                    aria-label="Close customer details"
                    onClick={onClose}
                    edge="end"
                    size="small"
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: 3,
                    minHeight: 220,
                }}
            >
                {isLoading && (
                    <CircularProgress aria-label="Loading customer details" />
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {customer && (
                    <Stack>
                        {details.map(({ label, value }, index) => (
                            <Box
                                key={label}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '140px 1fr',
                                    },
                                    alignItems: 'baseline',
                                    columnGap: 2,
                                    rowGap: 0.5,
                                    py: 1.75,
                                    borderBottom: index < details.length - 1
                                        ? '1px solid'
                                        : 'none',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                >
                                    {label}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 500,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default CustomerDetailsDialog
