import {
    Box,
    Button,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/auth/AuthProvider'
import {
    APP_SHELL_COPY,
    APP_SHELL_DRAWER_WIDTH,
    APP_SHELL_NAVIGATION,
} from './AppShell.constants'

function AppShell() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
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

                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {user?.username} ({user?.role})
                        </Typography>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleLogout}
                        >
                            {APP_SHELL_COPY.logout}
                        </Button>
                        <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ mt: 2 }}
                        >
                            {APP_SHELL_COPY.systemStatus}
                        </Typography>
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