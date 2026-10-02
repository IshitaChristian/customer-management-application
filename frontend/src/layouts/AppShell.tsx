import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/auth/useAuth'
import {
    APP_SHELL_COPY,
    APP_SHELL_DRAWER_WIDTH,
    APP_SHELL_NAVIGATION,
} from './AppShell.constants'

/** Provides the authenticated navigation shell and session logout action. */
function AppShell() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState<string | null>(null)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        setLogoutError(null)
        try {
            await logout()
            navigate('/login', { replace: true })
        } catch {
            setLogoutError(APP_SHELL_COPY.logoutFailed)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: APP_SHELL_DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: APP_SHELL_DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Stack sx={{ height: '100%' }}>
                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700 }}
                        >
                            {APP_SHELL_COPY.title}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            {APP_SHELL_COPY.subtitle}
                        </Typography>
                    </Box>

                    <Box component="nav" aria-label="Main navigation">
                        <List sx={{ px: 1 }}>
                            {APP_SHELL_NAVIGATION.map(({ label, to, end, Icon }) => (
                                <ListItemButton
                                    key={to}
                                    component={NavLink}
                                    to={to}
                                    end={end}
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 1,
                                        '&.active': {
                                            backgroundColor: 'action.selected',
                                            color: 'primary.main',
                                        },
                                        '&.active .MuiListItemIcon-root': {
                                            color: 'primary.main',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        <Icon />
                                    </ListItemIcon>
                                    <ListItemText primary={label} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {user?.username} ({user?.role})
                        </Typography>
                        {logoutError && (
                            <Alert severity="error" sx={{ mb: 1 }}>
                                {logoutError}
                            </Alert>
                        )}
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            startIcon={isLoggingOut
                                ? <CircularProgress size={16} />
                                : undefined}
                        >
                            {APP_SHELL_COPY.logout}
                        </Button>
                    </Box>
                </Stack>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    minWidth: 0,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}

export default AppShell