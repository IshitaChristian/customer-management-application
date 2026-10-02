import { isAfter, isValid, parseISO } from 'date-fns'
import { z } from 'zod'

export const ADD_CUSTOMER_DIALOG_COPY = {
    title: 'Add customer',
    description: 'Enter the customer details below.',
    firstName: 'First name',
    lastName: 'Last name',
    dateOfBirth: 'Date of birth',
    cancel: 'Cancel',
    submit: 'Add customer',
    submitting: 'Adding customer...',
    addFailed: 'Failed adding a new customer.',
} as const

export const ADD_CUSTOMER_FORM_ID = 'add-customer-form'
export const ADD_CUSTOMER_TITLE_ID = 'add-customer-title'
export const ADD_CUSTOMER_DESCRIPTION_ID = 'add-customer-description'
export const ADD_CUSTOMER_DIALOG_MAX_WIDTH = 'sm'
export const CUSTOMER_DATE_FORMAT = 'yyyy-MM-dd'
export const CUSTOMER_DATE_PICKER_OPEN_TO = 'year'
export const CUSTOMER_DATE_PICKER_VIEWS = [
    'year',
    'month',
    'day',
] as const

export const DEFAULT_CUSTOMER_FORM_VALUES = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
}

/** Mirrors backend field constraints so invalid customer data is caught early. */
export const CREATE_CUSTOMER_SCHEMA = z.object({
    firstName: z
        .string({
            error: 'First name is required',
        })
        .trim()
        .min(1, 'First name is required')
        .max(50, 'First name must be 50 characters or fewer'),
    lastName: z
        .string({
            error: 'Last name is required',
        })
        .trim()
        .min(1, 'Last name is required')
        .max(50, 'Last name must be 50 characters or fewer'),
    dateOfBirth: z
        .string({
            error: 'Date of birth is required',
        })
        .min(1, 'Date of birth is required')
        .refine((value) => {
            const date = parseISO(value)

            return isValid(date) && !isAfter(date, new Date())
        }, 'Please provide a valid date of birth'),
})

export type CreateCustomerFormValues = z.infer<
    typeof CREATE_CUSTOMER_SCHEMA
>
