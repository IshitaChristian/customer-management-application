import { zodResolver } from '@hookform/resolvers/zod'
import { Close } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format, isValid, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { createCustomer } from '../../api/customerApi'
import {
  ADD_CUSTOMER_DESCRIPTION_ID,
  ADD_CUSTOMER_DIALOG_COPY,
  ADD_CUSTOMER_DIALOG_MAX_WIDTH,
  ADD_CUSTOMER_FORM_ID,
  ADD_CUSTOMER_TITLE_ID,
  CREATE_CUSTOMER_SCHEMA,
  CUSTOMER_DATE_FORMAT,
  CUSTOMER_DATE_PICKER_OPEN_TO,
  CUSTOMER_DATE_PICKER_VIEWS,
  DEFAULT_CUSTOMER_FORM_VALUES,
  type CreateCustomerFormValues,
} from './AddCustomerDialog.constants'

interface AddCustomerDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

/** Collects validated customer details and reports successful creation to the page. */
function AddCustomerDialog({
  open,
  onClose,
  onCreated,
}: AddCustomerDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(CREATE_CUSTOMER_SCHEMA),
    mode: 'onSubmit',
    defaultValues: DEFAULT_CUSTOMER_FORM_VALUES,
  })
  const dateOfBirth = useWatch({
    control,
    name: 'dateOfBirth',
  })

  useEffect(() => {
    if (open) {
      reset()
    }
  }, [open, reset])

  const handleClose = () => {
    if (!isPending) {
      setError(null)
      onClose()
    }
  }

  const onSubmit = async (values: CreateCustomerFormValues) => {
    setIsPending(true)
    setError(null)

    try {
      await createCustomer(values)
    } catch (requestError: unknown) {
      setError(requestError)
      return
    } finally {
      setIsPending(false)
    }

    onCreated()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={ADD_CUSTOMER_DIALOG_MAX_WIDTH}
      aria-labelledby={ADD_CUSTOMER_TITLE_ID}
      aria-describedby={ADD_CUSTOMER_DESCRIPTION_ID}
    >
      <DialogTitle
        id={ADD_CUSTOMER_TITLE_ID}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1.5,
        }}
      >
        {ADD_CUSTOMER_DIALOG_COPY.title}
        <IconButton
          aria-label="Close add customer"
          onClick={handleClose}
          disabled={isPending}
          edge="end"
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pb: 4 }}>
        <Typography
          id={ADD_CUSTOMER_DESCRIPTION_ID}
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {ADD_CUSTOMER_DIALOG_COPY.description}
        </Typography>

        <Box
          component="form"
          id={ADD_CUSTOMER_FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Stack spacing={2.5}>
            {error !== null && (
              <Alert severity="error" role="alert">
                {error instanceof Error
                  ? error.message
                  : ADD_CUSTOMER_DIALOG_COPY.addFailed}
              </Alert>
            )}

            <TextField
              label={ADD_CUSTOMER_DIALOG_COPY.firstName}
              autoFocus
              {...register('firstName')}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              fullWidth
            />

            <TextField
              label={ADD_CUSTOMER_DIALOG_COPY.lastName}
              {...register('lastName')}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
              fullWidth
            />

            <DatePicker
              label={ADD_CUSTOMER_DIALOG_COPY.dateOfBirth}
              views={CUSTOMER_DATE_PICKER_VIEWS}
              openTo={CUSTOMER_DATE_PICKER_OPEN_TO}
              maxDate={new Date()}
              value={
                dateOfBirth && isValid(parseISO(dateOfBirth))
                  ? parseISO(dateOfBirth)
                  : null
              }
              onChange={(date) => {
                setValue(
                  'dateOfBirth',
                  date && isValid(date)
                    ? format(date, CUSTOMER_DATE_FORMAT)
                    : '',
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  },
                )
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.dateOfBirth),
                  helperText: errors.dateOfBirth?.message,
                },
              }}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
          disabled={isPending}
        >
          {ADD_CUSTOMER_DIALOG_COPY.cancel}
        </Button>

        <Button
          type="submit"
          form={ADD_CUSTOMER_FORM_ID}
          variant="contained"
          disabled={isPending}
          startIcon={
            isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isPending
            ? ADD_CUSTOMER_DIALOG_COPY.submitting
            : ADD_CUSTOMER_DIALOG_COPY.submit}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddCustomerDialog
