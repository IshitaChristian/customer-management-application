import { Box, CircularProgress } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../domains/auth/pages/LoginPage/LoginPage'
import AppShell from '../layouts/AppShell'
import CustomersPage from '../domains/customer-management/pages/CustomersPage/CustomersPage'
import { useAuth } from '../shared/auth/useAuth'

function AppRoutes() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <CircularProgress aria-label="Checking authentication" />
            </Box>
        )
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to="/customers" replace /> : <LoginPage />}/>
            <Route element={<AppShell />}>
                <Route
                    path="/"
                    element={<Navigate to={user ? '/customers' : '/login'} replace />}/>
                <Route
                    path="/customers"
                    element={user ? <CustomersPage /> : <Navigate to="/login" replace />}/>
            </Route>
            <Route path="*" element={<Navigate to={user ? '/customers' : '/login'} replace />} />
        </Routes>
    )
}

export default AppRoutes