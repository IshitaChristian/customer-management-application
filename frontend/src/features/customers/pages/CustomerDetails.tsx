import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCustomer } from '../services/customerApi'
import { customerKeys } from '../hooks/useCustomers'

function CustomerDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()

  const [successMessage, setSuccessMessage] = useState<string | null>(
      location.state?.successMessage ?? null,
  )

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      })
    }
  }, [location.pathname, location.state?.successMessage, navigate])

  const customerId = Number(id)

  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: () => getCustomer(customerId),
    enabled: Number.isInteger(customerId),
  })

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

  if (isError || !customer) {
    return (
        <Stack spacing={3}>
          <Box>
            <Typography
                variant="h4"
                sx={{ fontWeight: 700 }}
            >
              Customer not found
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
            >
              We couldn't load the requested customer.
            </Typography>
          </Box>

          <Alert severity="error">
            {error instanceof Error
                ? error.message
                : 'Customer could not be found.'}
          </Alert>

          <Box>
            <Button
                variant="outlined"
                onClick={() => navigate('/customers')}
            >
              Back to customers
            </Button>
          </Box>
        </Stack>
    )
  }

  return (
      <>
        <Stack spacing={4}>
          <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2,
              }}
          >
            <Box>
              <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
              >
                {customer.firstName} {customer.lastName}
              </Typography>

              <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
              >
                Customer details
              </Typography>
            </Box>

            <Button
                variant="outlined"
                onClick={() => navigate('/customers')}
            >
              Back to customers
            </Button>
          </Box>

          <Card sx={{ maxWidth: 720 }}>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    First name
                  </Typography>

                  <Typography
                      variant="body1"
                      sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    {customer.firstName}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    Last name
                  </Typography>

                  <Typography
                      variant="body1"
                      sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    {customer.lastName}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    Date of birth
                  </Typography>

                  <Typography
                      variant="body1"
                      sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    {customer.dateOfBirth}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                      variant="body2"
                      color="text.secondary"
                  >
                    Customer ID
                  </Typography>

                  <Typography
                      variant="body1"
                      sx={{ mt: 0.5, fontWeight: 500 }}
                  >
                    {customer.id}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
        <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={5000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
        >
          <Alert
              severity="success"
              onClose={() => setSuccessMessage(null)}
              variant="filled"
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </>
  )
}

export default CustomerDetails