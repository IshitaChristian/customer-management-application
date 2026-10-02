import { Refresh } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import type { ColDef, FilterChangedEvent, GridApi, ICellRendererParams } from 'ag-grid-community'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCustomerById } from '../../api/customerApi'
import type { Customer, CustomerSummary } from '../../types/customer'
import CustomerAppGrid from '../../../../shared/components/CustomerAppGrid/CustomerAppGrid'
import { CUSTOMER_PAGE_COPY } from '../../pages/CustomersPage/CustomersPage.constants'
import {
    CUSTOMER_COLUMN_DEFS,
    DEFAULT_ROWS_PER_PAGE,
    NO_CUSTOMERS_MATCH_MESSAGE,
    ROWS_PER_PAGE_OPTIONS,
} from './CustomerList.constants'

interface CustomerListProps {
    customers: CustomerSummary[]
    onAddCustomer: () => void
    onRefresh: () => void
    canManageCustomers: boolean
}

function CustomerList({
    customers,
    onAddCustomer,
    onRefresh,
    canManageCustomers,
}: CustomerListProps) {
    const gridApiRef = useRef<GridApi<CustomerSummary> | null>(null)
    const [hasActiveFilters, setHasActiveFilters] = useState(false)
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)

    const columnDefs = useMemo<ColDef<CustomerSummary>[]>(() => [
        ...CUSTOMER_COLUMN_DEFS,
        ...(canManageCustomers ? [{
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 160,
            cellRenderer: (params: ICellRendererParams<CustomerSummary>) =>
                params.data ? (
                    <Button
                        size="small"
                        onClick={() => setSelectedCustomerId(params.data!.id)}
                    >
                        View Details
                    </Button>
                ) : null,
        }] : []),
    ], [canManageCustomers])

    useEffect(() => {
        if (selectedCustomerId === null) {
            return
        }

        const controller = new AbortController()
        setSelectedCustomer(null)
        setDetailsError(null)
        setIsLoadingDetails(true)

        getCustomerById(selectedCustomerId, controller.signal)
            .then(setSelectedCustomer)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setDetailsError(
                        error instanceof Error
                            ? error.message
                            : 'Unable to load customer details.',
                    )
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoadingDetails(false)
                }
            })

        return () => controller.abort()
    }, [selectedCustomerId])

    const handleFilterChanged = useCallback(
        (event: FilterChangedEvent<CustomerSummary>) => {
            setHasActiveFilters(event.api.isAnyFilterPresent())
        },
        [],
    )

    const clearFilters = () => {
        gridApiRef.current?.setFilterModel(null)
        setHasActiveFilters(false)
    }

    if (customers.length === 0) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Box sx={{ py: 9, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 650 }}>
                            {CUSTOMER_PAGE_COPY.emptyTitle}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            {CUSTOMER_PAGE_COPY.emptyDescription}
                        </Typography>
                        {canManageCustomers && (
                            <Button
                                variant="contained"
                                sx={{ mt: 3 }}
                                onClick={onAddCustomer}
                            >
                                {CUSTOMER_PAGE_COPY.addCustomer}
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            variant="outlined"
            sx={{
                overflow: 'hidden',
                borderColor: '#dfe3e8',
                backgroundColor: 'background.paper',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.035)',
            }}
        >
            <Box
                sx={{
                    px: 3,
                    py: 2.25,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 650 }}>
                    {CUSTOMER_PAGE_COPY.title}
                </Typography>
                <Stack direction="row" spacing={1}>
                    {hasActiveFilters && (
                        <Button size="small" onClick={clearFilters}>
                            {CUSTOMER_PAGE_COPY.clearFilters}
                        </Button>
                    )}
                    <Tooltip title={CUSTOMER_PAGE_COPY.refreshCustomers}>
                        <IconButton
                            onClick={onRefresh}
                            aria-label={CUSTOMER_PAGE_COPY.refreshCustomers}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
            <CustomerAppGrid
                rowData={customers}
                columnDefs={columnDefs}
                paginationPageSize={DEFAULT_ROWS_PER_PAGE}
                paginationPageSizeSelector={ROWS_PER_PAGE_OPTIONS}
                getRowId={(customer) => customer.id.toString()}
                noRowsMessage={NO_CUSTOMERS_MATCH_MESSAGE}
                onGridReady={({ api }) => {
                    gridApiRef.current = api
                }}
                onFilterChanged={handleFilterChanged}
            />
            <Dialog
                open={selectedCustomerId !== null}
                onClose={() => setSelectedCustomerId(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Customer details</DialogTitle>
                <DialogContent dividers>
                    {isLoadingDetails && (
                        <CircularProgress aria-label="Loading customer details" />
                    )}
                    {detailsError && <Alert severity="error">{detailsError}</Alert>}
                    {selectedCustomer && (
                        <Stack spacing={1}>
                            <Typography>ID: {selectedCustomer.id}</Typography>
                            <Typography>
                                Name: {selectedCustomer.firstName} {selectedCustomer.lastName}
                            </Typography>
                            <Typography>
                                Date of birth: {selectedCustomer.dateOfBirth}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export default CustomerList
