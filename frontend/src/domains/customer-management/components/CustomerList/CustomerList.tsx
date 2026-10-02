import { Refresh } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import type { ColDef, FilterChangedEvent, GridApi, ICellRendererParams } from 'ag-grid-community'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { Customer } from '../../types/customer'
import CustomerAppGrid from '../../../../shared/components/CustomerAppGrid/CustomerAppGrid'
import { CUSTOMER_PAGE_COPY } from '../../pages/CustomersPage/CustomersPage.constants'
import {
    CUSTOMER_COLUMN_DEFS,
    DEFAULT_ROWS_PER_PAGE,
    NO_CUSTOMERS_MATCH_MESSAGE,
    ROWS_PER_PAGE_OPTIONS,
} from './CustomerList.constants'

interface CustomerListProps {
    customers: Customer[]
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
    const gridApiRef = useRef<GridApi<Customer> | null>(null)
    const [hasActiveFilters, setHasActiveFilters] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const columnDefs = useMemo<ColDef<Customer>[]>(() => [
        ...CUSTOMER_COLUMN_DEFS,
        ...(canManageCustomers ? [{
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 160,
            cellRenderer: (params: ICellRendererParams<Customer>) =>
                params.data ? (
                    <Button
                        size="small"
                        onClick={() => setSelectedCustomer(params.data ?? null)}
                    >
                        View Details
                    </Button>
                ) : null,
        }] : []),
    ], [canManageCustomers])

    const handleFilterChanged = useCallback(
        (event: FilterChangedEvent<Customer>) => {
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
                open={selectedCustomer !== null}
                onClose={() => setSelectedCustomer(null)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Customer details</DialogTitle>
                <DialogContent dividers>
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
