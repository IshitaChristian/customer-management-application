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
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MESSAGES from '../../../constants/messages'
import { useCustomers } from '../hooks/useCustomers'

type SortField =
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'dateOfBirth'

type SortDirection = 'asc' | 'desc'

function Customers() {
    const navigate = useNavigate()

    const [idFilter, setIdFilter] = useState('')
    const [firstNameFilter, setFirstNameFilter] =
        useState('')
    const [lastNameFilter, setLastNameFilter] =
        useState('')

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(15)

    const [sortField, setSortField] =
        useState<SortField | null>(null)
    const [sortDirection, setSortDirection] =
        useState<SortDirection>('asc')

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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((current) =>
                current === 'asc' ? 'desc' : 'asc',
            )
            return
        }

        setSortField(field)
        setSortDirection('asc')
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

            return sortDirection === 'asc'
                ? comparison
                : -comparison
        })
    }, [
        filteredCustomers,
        sortField,
        sortDirection,
    ])

    useEffect(() => {
        setPage(0)
    }, [
        idFilter,
        firstNameFilter,
        lastNameFilter,
        rowsPerPage,
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
        setIdFilter('')
        setFirstNameFilter('')
        setLastNameFilter('')
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
                        Customers
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Manage your customer records in one place.
                    </Typography>
                </Box>

                <Alert severity="error">
                    {error instanceof Error
                        ? error.message
                        : MESSAGES.customers.unableToLoad}
                </Alert>

                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => refetch()}
                    >
                        Try again
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
                        Customers
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 1,
                            fontSize: '0.95rem',
                        }}
                    >
                        Manage your customer records in one place.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={() =>
                        navigate('/customers/new')
                    }
                    sx={{
                        px: 2.75,
                        py: 1.1,
                        mt: 0.25,
                        fontWeight: 600,
                        boxShadow:
                            '0 4px 12px rgba(25, 118, 210, 0.18)',
                    }}
                >
                    Add Customer
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
                                No customers yet
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Add your first customer to get started.
                            </Typography>

                            <Button
                                variant="contained"
                                sx={{ mt: 3 }}
                                onClick={() =>
                                    navigate('/customers/new')
                                }
                            >
                                Add Customer
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
                                Total number of customers
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
                                Customers
                            </Typography>

                            {hasActiveFilters && (
                                <Button
                                    size="small"
                                    onClick={clearFilters}
                                >
                                    Clear filters
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
                                                        active={sortField === 'id'}
                                                        direction={
                                                            sortField === 'id'
                                                                ? sortDirection
                                                                : 'asc'
                                                        }
                                                        onClick={() =>
                                                            handleSort('id')
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            ID
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={idFilter}
                                                    onChange={(event) =>
                                                        setIdFilter(
                                                            event.target.value,
                                                        )
                                                    }
                                                    size="small"
                                                    type="number"
                                                    placeholder="Filter"
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
                                                            sortField === 'firstName'
                                                        }
                                                        direction={
                                                            sortField === 'firstName'
                                                                ? sortDirection
                                                                : 'asc'
                                                        }
                                                        onClick={() =>
                                                            handleSort('firstName')
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            First name
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={firstNameFilter}
                                                    onChange={(event) =>
                                                        setFirstNameFilter(
                                                            event.target.value,
                                                        )
                                                    }
                                                    size="small"
                                                    placeholder="Filter"
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
                                                            sortField === 'lastName'
                                                        }
                                                        direction={
                                                            sortField === 'lastName'
                                                                ? sortDirection
                                                                : 'asc'
                                                        }
                                                        onClick={() =>
                                                            handleSort('lastName')
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            Last name
                                                        </Typography>
                                                    </TableSortLabel>
                                                </Box>

                                                <TextField
                                                    value={lastNameFilter}
                                                    onChange={(event) =>
                                                        setLastNameFilter(
                                                            event.target.value,
                                                        )
                                                    }
                                                    size="small"
                                                    placeholder="Filter"
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
                                                            sortField === 'dateOfBirth'
                                                        }
                                                        direction={
                                                            sortField === 'dateOfBirth'
                                                                ? sortDirection
                                                                : 'asc'
                                                        }
                                                        onClick={() =>
                                                            handleSort('dateOfBirth')
                                                        }
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            Date of birth
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
                                            onClick={() =>
                                                navigate(
                                                    `/customers/${customer.id}`,
                                                )
                                            }
                                            sx={{
                                                cursor: 'pointer',
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
                                                        No customers found
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        Try adjusting your filters.
                                                    </Typography>

                                                    <Button
                                                        size="small"
                                                        sx={{ mt: 2 }}
                                                        onClick={clearFilters}
                                                    >
                                                        Clear filters
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
                            <Tooltip title="Refresh customers">
                                <IconButton
                                    onClick={() => refetch()}
                                    aria-label="Refresh customers"
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
                                    setRowsPerPage(
                                        Number(event.target.value),
                                    )
                                }}
                                rowsPerPageOptions={[
                                    10,
                                    15,
                                    25,
                                    50,
                                ]}
                            />
                        </Box>
                    </Card>
                </>
            )}
        </Stack>
    )
}

export default Customers