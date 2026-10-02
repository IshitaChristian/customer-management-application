import type { ColDef } from 'ag-grid-community'
import type { CustomerSummary } from '../../types/customer'

export const DEFAULT_ROWS_PER_PAGE = 15
export const ROWS_PER_PAGE_OPTIONS = [10, 15, 25, 50]
export const NO_CUSTOMERS_MATCH_MESSAGE =
    'No customers found. Try adjusting your filters.'

export const CUSTOMER_COLUMN_DEFS: ColDef<CustomerSummary>[] = [
    {
        field: 'id',
        headerName: 'ID',
        filter: 'agNumberColumnFilter',
        minWidth: 130,
        maxWidth: 180,
    },
    { field: 'firstName', headerName: 'First name', minWidth: 180 },
    { field: 'lastName', headerName: 'Last name', minWidth: 180 },
]
