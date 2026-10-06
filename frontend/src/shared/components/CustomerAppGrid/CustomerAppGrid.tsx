import {
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    themeQuartz,
    type ColDef,
    type FilterChangedEvent,
    type GridReadyEvent,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { CSSProperties } from 'react'
import { Box } from '@mui/material'

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
])

const defaultTheme = themeQuartz.withParams({
    accentColor: '#1976d2',
    backgroundColor: '#ffffff',
    borderColor: '#e8ebef',
    borderRadius: 0,
    wrapperBorderRadius: 0,
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
    headerBackgroundColor: '#f8fafc',
    headerFontWeight: 700,
    rowHoverColor: '#f5f7fa',
})

const defaultColumnDefinition = {
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    minWidth: 140,
    flex: 1,
}

export interface CustomerAppGridProps<TData> {
    rowData: TData[]
    columnDefs: ColDef<TData>[]
    paginationPageSize: number
    paginationPageSizeSelector: number[]
    noRowsMessage: string
    getRowId: (data: TData) => string
    height?: CSSProperties['height']
    onGridReady?: (event: GridReadyEvent<TData>) => void
    onFilterChanged?: (event: FilterChangedEvent<TData>) => void
}

/** Applies the application's shared grid defaults while keeping row data generic. */
function CustomerAppGrid<TData>({
    rowData,
    columnDefs,
    paginationPageSize,
    paginationPageSizeSelector,
    noRowsMessage,
    getRowId,
    height = 'clamp(360px, 62vh, 620px)',
    onGridReady,
    onFilterChanged,
}: CustomerAppGridProps<TData>) {
    return (
        <Box
            component="section"
            aria-label="Data grid"
            sx={{
                width: '100%',
                height,
                minWidth: 0,
                overflow: 'hidden',
            }}
        >
            <AgGridReact<TData>
                theme={defaultTheme}
                rowData={rowData}
                getRowId={({ data }) => getRowId(data)}
                columnDefs={columnDefs}
                defaultColDef={defaultColumnDefinition}
                pagination
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}
                animateRows
                localeText={{
                    noRowsToShow: noRowsMessage,
                    noMatchingRows: noRowsMessage,
                }}
                onGridReady={onGridReady}
                onFilterChanged={onFilterChanged}
            />
        </Box>
    )
}

export default CustomerAppGrid
