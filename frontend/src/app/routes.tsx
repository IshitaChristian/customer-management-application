import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../layouts/AppShell'
import CustomersPage from '../domains/customer-management/pages/CustomersPage/CustomersPage'

function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/customers" replace />} />
                <Route path="/customers" element={<CustomersPage />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes