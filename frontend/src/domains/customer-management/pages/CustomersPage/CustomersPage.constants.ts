export const CUSTOMER_PAGE_COPY = {
    title: 'Customers',
    description: 'Manage your customer records in one place.',
    customerIdColumn: 'ID',
    firstNameColumn: 'First name',
    lastNameColumn: 'Last name',
    dateOfBirthColumn: 'Date of birth',
    addCustomer: 'Add Customer',
    emptyTitle: 'No customers yet',
    emptyDescription: 'Add your first customer to get started.',
    totalCustomers: 'Total number of customers',
    clearFilters: 'Clear filters',
    noCustomersFound: 'No customers found',
    adjustFilters: 'Try adjusting your filters.',
    filterPlaceholder: 'Filter',
    retryLoad: 'Try again',
    refreshCustomers: 'Refresh customers',
    addedSuccessfully: 'Customer added successfully.',
    unableToLoad: 'Unable to load customers.',
} as const

export const DEFAULT_ROWS_PER_PAGE = 15
export const DEFAULT_PAGE_INDEX = 0
export const INITIAL_FILTER_VALUE = ''
export const ROWS_PER_PAGE_OPTIONS = [10, 15, 25, 50]
export const CREATED_NOTIFICATION_DURATION_MS = 5000
export const ASCENDING = 'asc'
export const DESCENDING = 'desc'

export const CUSTOMER_SORT_FIELD = {
    ID: 'id',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    DATE_OF_BIRTH: 'dateOfBirth',
} as const

export type CustomerSortField =
    (typeof CUSTOMER_SORT_FIELD)[keyof typeof CUSTOMER_SORT_FIELD]

export type SortDirection = typeof ASCENDING | typeof DESCENDING

export const DEFAULT_SORT_DIRECTION: SortDirection = ASCENDING
