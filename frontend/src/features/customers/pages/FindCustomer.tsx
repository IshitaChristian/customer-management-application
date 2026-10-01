import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MESSAGES from '../../../constants/messages'
import { getCustomer } from '../services/customerApi'

function FindCustomer() {
    const navigate = useNavigate()

    const [customerId, setCustomerId] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    const handleFindCustomer = async () => {
        const id = Number(customerId)

        if (!Number.isInteger(id) || id <= 0) {
            setErrorMessage(MESSAGES.customers.invalidId)
            return
        }

        setErrorMessage('')
        setIsSearching(true)

        try {
            const customer = await getCustomer(id)

            navigate(`/customers/${customer.id}`)
        } catch {
            setErrorMessage(
                `Customer with ID ${id} was not found. Please enter a valid customer ID.`,
            )
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <>
            <Stack spacing={4}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700 }}
                    >
                        Find customer
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Find a customer using their customer ID.
                    </Typography>
                </Box>

                <Card sx={{ maxWidth: 720 }}>
                    <CardContent>
                        <Stack spacing={3}>
                            <TextField
                                label="Customer ID"
                                value={customerId}
                                onChange={(event) =>
                                    setCustomerId(event.target.value)
                                }
                                type="number"
                                fullWidth
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={handleFindCustomer}
                                    disabled={
                                        isSearching || !customerId.trim()
                                    }
                                >
                                    {isSearching
                                        ? 'Finding...'
                                        : 'Find customer'}
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={5000}
                onClose={() => setErrorMessage('')}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity="error"
                    onClose={() => setErrorMessage('')}
                    variant="filled"
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    )
}

export default FindCustomer