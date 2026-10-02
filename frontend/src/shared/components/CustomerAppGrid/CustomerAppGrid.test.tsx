import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ColDef } from 'ag-grid-community'
import CustomerAppGrid from './CustomerAppGrid'

const { mockGridProps } = vi.hoisted(() => ({
    mockGridProps: vi.fn(),
}))

vi.mock('ag-grid-react', () => ({
    AgGridReact: (props: Record<string, unknown>) => {
        mockGridProps(props)
        return <div data-testid="ag-grid" />
    },
}))

interface Row {
    id: number
    name: string
}

describe('CustomerAppGrid', () => {
    beforeEach(() => {
        mockGridProps.mockClear()
    })

    it('applies the shared grid defaults and forwards row and pagination configuration', () => {
        const rows: Row[] = [{ id: 1, name: 'Ada' }]
        const columns: ColDef<Row>[] = [
            { field: 'id' },
            { field: 'name' },
        ]

        render(
            <CustomerAppGrid
                rowData={rows}
                columnDefs={columns}
                paginationPageSize={15}
                paginationPageSizeSelector={[10, 15, 25]}
                noRowsMessage="No customers found"
                getRowId={(row) => row.id.toString()}
            />,
        )

        expect(screen.getByTestId('ag-grid')).toBeInTheDocument()
        expect(screen.getByRole('region', { name: 'Data grid' }))
            .toBeInTheDocument()

        const props = mockGridProps.mock.calls[0][0]
        expect(props).toMatchObject({
            rowData: rows,
            columnDefs: columns,
            pagination: true,
            paginationPageSize: 15,
            paginationPageSizeSelector: [10, 15, 25],
            defaultColDef: {
                sortable: true,
                filter: true,
                floatingFilter: true,
                resizable: true,
            },
        })
        expect(props.localeText).toEqual({
            noRowsToShow: 'No customers found',
            noMatchingRows: 'No customers found',
        })
        expect(props.getRowId({ data: rows[0] })).toBe('1')
    })

})
