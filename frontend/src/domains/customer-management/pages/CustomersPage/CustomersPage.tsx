import { Refresh } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    IconButton,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import AddCustomerDialog from '../../components/AddCustomerDialog/AddCustomerDialog'
import { useCustomers } from '../../hooks/useCustomers'
import {
    ASCENDING,
    CREATED_NOTIFICATION_DURATION_MS,
    CUSTOMER_PAGE_COPY,
    CUSTOMER_SORT_FIELD,
    DEFAULT_PAGE_INDEX,
    DEFAULT_ROWS_PER_PAGE,
    DEFAULT_SORT_DIRECTION,
    DESCENDING,
    INITIAL_FILTER_VALUE,
    ROWS_PER_PAGE_OPTIONS,
    type CustomerSortField,
    type SortDirection,
} from './CustomersPage.constants'

function CustomersPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] =
        useState(false)
    const [showCreatedMessage, setShowCreatedMessage] =
        useState(false)

    const [idFilter, setIdFilter] = useState(INITIAL_FILTER_VALUE)
    const [firstNameFilter, setFirstNameFilter] =
        useState(INITIAL_FILTER_VALUE)
    const [lastNameFilter, setLastNameFilter] =
        useState(INITIAL_FILTER_VALUE)

    const [page, setPage] = useState(DEFAULT_PAGE_INDEX)
    const [rowsPerPage, setRowsPerPage] = useState(
        DEFAULT_ROWS_PER_PAGE,
    )

    const [sortField, setSortField] =
        useState<CustomerSortField | null>(null)
    const [sortDirection, setSortDirection] =
        useState<SortDirection>(DEFAULT_SORT_DIRECTION)

    const {
        data: customers,
        isLoading,
        isError,
        error,
        refetch,
    } = useCustomers()

    const hasActiveFilters =
        Boolean(idFilter) ||
        Boolean(firstNameFilter) ||
        Boolean(lastNameFilter)

    const filteredCustomers = useMemo(() => {
        return customers?.filter((customer) => {
            const matchesId =
                !idFilter ||
                customer.id.toString() === idFilter

            const matchesFirstName =
                !firstNameFilter ||
                customer.firstName
                    .toLowerCase()
                    .includes(firstNameFilter.toLowerCase())

            const matchesLastName =
                !lastNameFilter ||
                customer.lastName
                    .toLowerCase()
                    .includes(lastNameFilter.toLowerCase())

            return (
                matchesId &&
                matchesFirstName &&
                matchesLastName
            )
        })
    }, [
        customers,
        idFilter,
        firstNameFilter,
        lastNameFilter,
    ])

    const handleSort = (field: CustomerSortField) => {
        setPage(DEFAULT_PAGE_INDEX)

        if (sortField === field) {
            setSortDirection((current) =>
                current === ASCENDING ? DESCENDING : ASCENDING,
            )
            return
        }

        setSortField(field)
        setSortDirection(DEFAULT_SORT_DIRECTION)
    }

    const sortedCustomers = useMemo(() => {
        if (!filteredCustomers) {
            return []
        }

        if (!sortField) {
            return filteredCustomers
        }

        return [...filteredCustomers].sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            const comparison =
                typeof aValue === 'number' &&
                typeof bValue === 'number'
                    ? aValue - bValue
                    : String(aValue).localeCompare(
                        String(bValue),
                        undefined,
                        {
                            numeric: true,
                            sensitivity: 'base',
                        },
                    )

            return sortDirection === ASCENDING
                ? comparison
                : -comparison
        })
    }, [
        filteredCustomers,
        sortField,
        sortDirection,
    ])

    const paginatedCustomers = useMemo(() => {
        const startIndex = page * rowsPerPage
        const endIndex = startIndex + rowsPerPage

        return sortedCustomers.slice(
            startIndex,
            endIndex,
        )
    }, [
        sortedCustomers,
        page,
        rowsPerPage,
    ])

    const clearFilters = () => {
        setPage(DEFAULT_PAGE_INDEX)
        setIdFilter(INITIAL_FILTER_VALUE)
        setFirstNameFilter(INITIAL_FILTER_VALUE)
        setLastNameFilter(INITIAL_FILTER_VALUE)
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '50vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    if (isError) {
        return (
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {CUSTOMER_PAGE_COPY.title}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        {CUSTOMER_PAGE_COPY.description}
                    </Typography>
                </Box>

                <Alert severity="error">
                    {error instanceof Error
                        ? error.message
                        : CUSTOMER_PAGE_COPY.unableToLoad}
                </Alert>

                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refetch()}
                    >
                        {CUSTOMER_PAGE_COPY.retryLoad}
                    </Button>
                </Box>
            </Stack>
        )
    }

    return (
        <Stack spacing={3.5}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        {CUSTOMER_PAGE_COPY.title}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 1,
                            fontSize: '0.95rem',
                        }}
                    >
                        {CUSTOMER_PAGE_COPY.description}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={() => setIsAddDialogOpen(true)}
                    sx={{
                        px: 2.75,
                        py: 1.1,
                        mt: 0.25,
                        fontWeight: 600,
                        boxShadow:
                            '0 4px 12px rgba(25, 118, 210, 0.18)',
                    }}
                >
                    {CUSTOMER_PAGE_COPY.addCustomer}
                </Button>
            </Box>

            {customers?.length === 0 ? (
                <Card variant="outlined">
                    <CardContent>
                        <Box
                            sx={{
                                py: 9,
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 650 }}
                            >
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
                                onClick={() =>
                                    setIsAddDialogOpen(true)
                                }
                            >
                                {CUSTOMER_PAGE_COPY.addCustomer}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card
                        variant="outlined"
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            background:
                                'linear-gradient(135deg, #ffffff 0%, #f7faff 100%)',
                            borderColor: '#dfe6ef',
                            boxShadow:
                                '0 8px 24px rgba(15, 23, 42, 0.04)',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: 4,
                                height: '100%',
                                backgroundColor: 'primary.main',
                            }}
                        />

                        <CardContent
                            sx={{
                                px: 3.5,
                                py: 2.75,
                                '&:last-child': {
                                    pb: 2.75,
                                },
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    display: 'block',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    color: 'text.secondary',
                                    lineHeight: 1.4,
                                }}
                            >
                                {CUSTOMER_PAGE_COPY.totalCustomers}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.5,
                                    fontSize: '2.25rem',
                                    lineHeight: 1.1,
                                    fontWeight: 750,
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                {customers?.length ?? 0}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{
                            overflow: 'hidden',
                            borderColor: '#dfe3e8',
                            backgroundColor: 'background.paper',
                            boxShadow:
                                '0 6px 20px rgba(15, 23, 42, 0.035)',
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
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 650 }}
                            >
                                {CUSTOMER_PAGE_COPY.title}
                            </Typography>

                            {hasActiveFilters && (
                                <Button
                                    size="small"
                                    onClick={clearFilters}
                                >
                                    {CUSTOMER_PAGE_COPY.clearFilters}
                                </Button>
                            )}
                        </Box>

                        <Divider />

                        <TableContainer
                            sx={{
                                maxHeight: 'calc(100vh - 360px)',
                                overflow: 'auto',
                            }}
                        >
                            <Table
                                stickyHeader
                                sx={{ minWidth: 720 }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                minWidth: 150,
                                                verticalAlign: 'top',
                                                backgroundColor: '#f8fafc',
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        minHeight: 38,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <TableSortLabel
                                                        active={sortField === CUSTOMER_SORT_FIELD.ID}
                                                        direction={
                                                            sortField === CUSTOMER_SORT_FIELD.ID
                                                                ? sortDirection
                                                                : DEFAULT_SORT_DIRECTION
                                                        }
                                                        onClick={() =>
                                                            handleSort(CUSTOMER_SORT_FIELD.ID)
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {CUSTOMER_PAGE_COPY.customerIdColumn}
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={idFilter}
                                                    onChange={(event) => {
                                                        setPage(DEFAULT_PAGE_INDEX)
                                                        setIdFilter(
                                                            event.target.value,
                                                        )
                                                    }}
                                                    size="small"
                                                    type="number"
                                                    placeholder={CUSTOMER_PAGE_COPY.filterPlaceholder}
                                                    fullWidth
                                                />
                                            </Stack>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                minWidth: 220,
                                                verticalAlign: 'top',
                                                backgroundColor: '#f8fafc',
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        minHeight: 38,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <TableSortLabel
                                                        active={
                                                            sortField === CUSTOMER_SORT_FIELD.FIRST_NAME
                                                        }
                                                        direction={
                                                            sortField === CUSTOMER_SORT_FIELD.FIRST_NAME
                                                                ? sortDirection
                                                                : DEFAULT_SORT_DIRECTION
                                                        }
                                                        onClick={() =>
                                                            handleSort(CUSTOMER_SORT_FIELD.FIRST_NAME)
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {CUSTOMER_PAGE_COPY.firstNameColumn}
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={firstNameFilter}
                                                    onChange={(event) => {
                                                        setPage(DEFAULT_PAGE_INDEX)
                                                        setFirstNameFilter(
                                                            event.target.value,
                                                        )
                                                    }}
                                                    size="small"
                                                    placeholder={CUSTOMER_PAGE_COPY.filterPlaceholder}
                                                    fullWidth
                                                />
                                            </Stack>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                minWidth: 220,
                                                verticalAlign: 'top',
                                                backgroundColor: '#f8fafc',
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        minHeight: 38,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <TableSortLabel
                                                        active={
                                                            sortField === CUSTOMER_SORT_FIELD.LAST_NAME
                                                        }
                                                        direction={
                                                            sortField === CUSTOMER_SORT_FIELD.LAST_NAME
                                                                ? sortDirection
                                                                : DEFAULT_SORT_DIRECTION
                                                        }
                                                        onClick={() =>
                                                            handleSort(CUSTOMER_SORT_FIELD.LAST_NAME)
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {CUSTOMER_PAGE_COPY.lastNameColumn}
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={lastNameFilter}
                                                    onChange={(event) => {
                                                        setPage(DEFAULT_PAGE_INDEX)
                                                        setLastNameFilter(
                                                            event.target.value,
                                                        )
                                                    }}
                                                    size="small"
                                                    placeholder={CUSTOMER_PAGE_COPY.filterPlaceholder}
                                                    fullWidth
                                                />
                                            </Stack>
                                        </TableCell>

                                        <TableCell
                                            sx={{
                                                minWidth: 170,
                                                verticalAlign: 'top',
                                                backgroundColor: '#f8fafc',
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Box
                                                    sx={{
                                                        minHeight: 38,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <TableSortLabel
                                                        active={
                                                            sortField === CUSTOMER_SORT_FIELD.DATE_OF_BIRTH
                                                        }
                                                        direction={
                                                            sortField === CUSTOMER_SORT_FIELD.DATE_OF_BIRTH
                                                                ? sortDirection
                                                                : DEFAULT_SORT_DIRECTION
                                                        }
                                                        onClick={() =>
                                                            handleSort(CUSTOMER_SORT_FIELD.DATE_OF_BIRTH)
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {CUSTOMER_PAGE_COPY.dateOfBirthColumn}
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <Box sx={{ height: 40 }} />
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {paginatedCustomers.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            hover
                                            sx={{
                                                '&:last-child td': {
                                                    borderBottom: 0,
                                                },
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {customer.id}
                                            </TableCell>

                                            <TableCell>
                                                {customer.firstName}
                                            </TableCell>

                                            <TableCell>
                                                {customer.lastName}
                                            </TableCell>

                                            <TableCell>
                                                {customer.dateOfBirth}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {sortedCustomers.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                align="center"
                                            >
                                                <Box sx={{ py: 5 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        {CUSTOMER_PAGE_COPY.noCustomersFound}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        {CUSTOMER_PAGE_COPY.adjustFilters}
                                                    </Typography>

                                                    <Button
                                                        size="small"
                                                        sx={{ mt: 2 }}
                                                        onClick={clearFilters}
                                                    >
                                                        {CUSTOMER_PAGE_COPY.clearFilters}
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider />

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 1,
                            }}
                        >
                            <Tooltip title={CUSTOMER_PAGE_COPY.refreshCustomers}>
                                <IconButton
                                    onClick={() => refetch()}
                                    aria-label={CUSTOMER_PAGE_COPY.refreshCustomers}
                                >
                                    <Refresh />
                                </IconButton>
                            </Tooltip>

                            <TablePagination
                                component="div"
                                count={sortedCustomers.length}
                                page={page}
                                onPageChange={(_, newPage) =>
                                    setPage(newPage)
                                }
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setPage(DEFAULT_PAGE_INDEX)
                                    setRowsPerPage(
                                        Number(event.target.value),
                                    )
                                }}
                                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                            />
                        </Box>
                    </Card>
                </>
            )}
            <AddCustomerDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onCreated={() => setShowCreatedMessage(true)}
            />

            <Snackbar
                open={showCreatedMessage}
                autoHideDuration={CREATED_NOTIFICATION_DURATION_MS}
                onClose={() => setShowCreatedMessage(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity="success"
                    onClose={() => setShowCreatedMessage(false)}
                    variant="filled"
                >
                    {CUSTOMER_PAGE_COPY.addedSuccessfully}
                </Alert>
            </Snackbar>
        </Stack>
    )
}

export default CustomersPage