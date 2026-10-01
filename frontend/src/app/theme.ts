import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f5f7fa',
        },
    },

    shape: {
        borderRadius: 10,
    },

    typography: {
        fontFamily:
            '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

        h4: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
        },

        h6: {
            fontWeight: 650,
            letterSpacing: '-0.015em',
        },

        body1: {
            fontSize: '0.95rem',
        },

        body2: {
            fontSize: '0.875rem',
        },
    },

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor: '#e8ebef',
                },

                head: {
                    fontWeight: 700,
                },
            },
        },
    },
})

export default theme