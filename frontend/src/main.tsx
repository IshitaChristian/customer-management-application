import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import theme from './app/theme'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <App />
            </LocalizationProvider>
        </ThemeProvider>
    </StrictMode>,
)
