import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '../components/AppShell'
import AddCustomer from '../features/customers/pages/AddCustomer'
import CustomerDetails from '../features/customers/pages/CustomerDetails'
import Customers from '../features/customers/pages/Customers'
import FindCustomer from '../features/customers/pages/FindCustomer'

function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route
                    path="/"
                    element={<Navigate to="/customers" replace />}
                />

                <Route
                    path="/customers"
                    element={<Customers />}
                />

                <Route
                    path="/customers/new"
                    element={<AddCustomer />}
                />

                <Route
                    path="/customers/find"
                    element={<FindCustomer />}
                />

                <Route
                    path="/customers/:id"
                    element={<CustomerDetails />}
                />
            </Route>
        </Routes>
    )
}

export default AppRoutes