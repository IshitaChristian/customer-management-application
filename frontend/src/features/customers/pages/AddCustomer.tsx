import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format, isAfter, parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useCreateCustomer } from '../hooks/useCustomers'

const createCustomerSchema = z.object({
  firstName: z
      .string({
        error: 'First name is required',
      })
      .trim()
      .min(1, 'First name is required')
      .regex(
          /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
          'Please provide a valid first name',
      ),

  lastName: z
      .string({
        error: 'Last name is required',
      })
      .trim()
      .min(1, 'Last name is required')
      .regex(
          /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
          'Please provide a valid last name',
      ),

  dateOfBirth: z
      .string({
        error: 'Date of birth is required',
      })
      .min(1, 'Date of birth is required')
      .refine(
          (value) => {
            const date = parseISO(value)

            return !isAfter(date, new Date())
          },
          'Please provide a valid date of birth',
      ),
})

type CreateCustomerFormValues = z.infer<
    typeof createCustomerSchema
>

function AddCustomer() {
  const navigate = useNavigate()
  const createCustomerMutation = useCreateCustomer()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    mode: 'onSubmit',
  })

  const dateOfBirth = watch('dateOfBirth')

  const onSubmit = (values: CreateCustomerFormValues) => {
    createCustomerMutation.mutate(values, {
      onSuccess: (customer) => {
        navigate(`/customers/${customer.id}`, {
          state: {
            successMessage: 'Customer added successfully.',
          },
        })
      },
    })
  }

  return (
      <Stack spacing={4}>
        <Box>
          <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
          >
            Add new customer.
          </Typography>

          <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
          >
            Add a new customer to the system.
          </Typography>
        </Box>

        <Card sx={{ maxWidth: 720 }}>
          <CardContent>
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
            >
              <Stack spacing={3}>
                {createCustomerMutation.isError && (
                    <Alert severity="error">
                      {createCustomerMutation.error instanceof Error
                          ? createCustomerMutation.error.message
                          : 'Failed adding a new customer'}
                    </Alert>
                )}

                <TextField
                    label="First name"
                    {...register('firstName')}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                    fullWidth
                />

                <TextField
                    label="Last name"
                    {...register('lastName')}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                    fullWidth
                />

                <DatePicker
                    label="Date of birth"
                    views={['year', 'month', 'day']}
                    openTo="year"
                    maxDate={new Date()}
                    value={
                      dateOfBirth
                          ? parseISO(dateOfBirth)
                          : null
                    }
                    onChange={(date) => {
                      setValue(
                          'dateOfBirth',
                          date
                              ? format(date, 'yyyy-MM-dd')
                              : '',
                          {
                            shouldValidate: true,
                          },
                      )
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: Boolean(errors.dateOfBirth),
                        helperText:
                        errors.dateOfBirth?.message,
                      },
                    }}
                />

                <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 2,
                    }}
                >
                  <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/customers')}
                      disabled={createCustomerMutation.isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                      type="submit"
                      variant="contained"
                      disabled={createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending
                        ? 'Adding Customer...'
                        : 'Add Customer'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
  )
}

export default AddCustomer