const MESSAGES = {
    common: {
        unexpectedError:
            'An unexpected error occurred.',

        serverUnavailable:
            'Unable to connect to the server. Please try again.',

        somethingWentWrong:
            'Something went wrong. Please try again.',
    },

    customers: {
        addFailed:
            'Failed adding a new customer.',

        addedSuccessfully:
            'Customer added successfully.',

        notFound:
            'Customer not found',

        invalidId:
            'Please enter a valid customer ID.',

        unableToLoad:
            'Unable to load customers.',
    },
} as const

export default MESSAGES