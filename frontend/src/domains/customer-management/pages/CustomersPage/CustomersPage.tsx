import { Refresh } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Snackbar,
    Stack,
} from '@mui/material'
import { lazy, Suspense, useState } from 'react'
import AddCustomerDialog from '../../components/AddCustomerDialog/AddCustomerDialog'
import CustomersHeader from '../../components/CustomersHeader/CustomersHeader'
import { useCustomers } from '../../hooks/useCustomers'
import {
    CREATED_NOTIFICATION_DURATION_MS,
    CUSTOMER_PAGE_COPY,
} from './CustomersPage.constants'

const CustomerList = lazy(
    () => import('../../components/CustomerList/CustomerList'),
)

function CustomersPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [showCreatedMessage, setShowCreatedMessage] = useState(false)
    const {
        data: customers = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useCustomers()

    return (
        <>
            {isLoading ? (
                <Box
                    sx={{
                        minHeight: '50vh',
                        display: 'grid',
                        placeItems: 'center',
                    }}
                >
                    <CircularProgress aria-label="Loading customers" />
                </Box>
            ) : isError ? (
                <Stack spacing={3}>
                    <CustomersHeader
                        customerCount={customers.length}
                        onAddCustomer={() => setIsAddDialogOpen(true)}
                    />
                    <Alert severity="error">
                        {error instanceof Error
                            ? error.message
                            : CUSTOMER_PAGE_COPY.unableToLoad}
                    </Alert>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refetch()}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        {CUSTOMER_PAGE_COPY.retryLoad}
                    </Button>
                </Stack>
            ) : (
                <Stack spacing={3.5}>
                    <CustomersHeader
                        customerCount={customers.length}
                        onAddCustomer={() => setIsAddDialogOpen(true)}
                    />
                    <Suspense
                        fallback={
                            <Box
                                sx={{
                                    minHeight: 360,
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >
                                <CircularProgress
                                    aria-label="Loading customer list"
                                />
                            </Box>
                        }
                    >
                        <CustomerList
                            customers={customers}
                            onAddCustomer={() => setIsAddDialogOpen(true)}
                            onRefresh={() => refetch()}
                        />
                    </Suspense>
                </Stack>
            )}
            <AddCustomerDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onCreated={() => {
                    refetch()
                    setShowCreatedMessage(true)
                }}
            />
            <Snackbar
                open={showCreatedMessage}
                autoHideDuration={CREATED_NOTIFICATION_DURATION_MS}
                onClose={() => setShowCreatedMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="success"
                    onClose={() => setShowCreatedMessage(false)}
                    variant="filled"
                >
                    {CUSTOMER_PAGE_COPY.addedSuccessfully}
                </Alert>
            </Snackbar>
        </>
    )
}

export default CustomersPage
