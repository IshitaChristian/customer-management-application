import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { CUSTOMER_PAGE_COPY } from '../../pages/CustomersPage/CustomersPage.constants'

interface CustomersHeaderProps {
    customerCount: number
    onAddCustomer: () => void
}

function CustomersHeader({
    customerCount,
    onAddCustomer,
}: CustomersHeaderProps) {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 3,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {CUSTOMER_PAGE_COPY.title}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1, fontSize: '0.95rem' }}
                    >
                        {CUSTOMER_PAGE_COPY.description}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={onAddCustomer}
                    sx={{
                        px: 2.75,
                        py: 1.1,
                        mt: 0.25,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.18)',
                    }}
                >
                    {CUSTOMER_PAGE_COPY.addCustomer}
                </Button>
            </Box>
            <Card
                variant="outlined"
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                        'linear-gradient(135deg, #ffffff 0%, #f7faff 100%)',
                    borderColor: '#dfe6ef',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
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
                        '&:last-child': { pb: 2.75 },
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
                        {customerCount}
                    </Typography>
                </CardContent>
            </Card>
        </>
    )
}

export default CustomersHeader
