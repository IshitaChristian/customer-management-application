import { Refresh } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import type { FilterChangedEvent, GridApi } from 'ag-grid-community'
import { useCallback, useRef, useState } from 'react'
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
}

function CustomerList({
    customers,
    onAddCustomer,
    onRefresh,
}: CustomerListProps) {
    const gridApiRef = useRef<GridApi<Customer> | null>(null)
    const [hasActiveFilters, setHasActiveFilters] = useState(false)

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
                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={onAddCustomer}
                        >
                            {CUSTOMER_PAGE_COPY.addCustomer}
                        </Button>
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
                columnDefs={CUSTOMER_COLUMN_DEFS}
                paginationPageSize={DEFAULT_ROWS_PER_PAGE}
                paginationPageSizeSelector={ROWS_PER_PAGE_OPTIONS}
                getRowId={(customer) => customer.id.toString()}
                noRowsMessage={NO_CUSTOMERS_MATCH_MESSAGE}
                onGridReady={({ api }) => {
                    gridApiRef.current = api
                }}
                onFilterChanged={handleFilterChanged}
            />
        </Card>
    )
}

export default CustomerList
