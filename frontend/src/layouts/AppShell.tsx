import { NavLink, Outlet } from 'react-router-dom'
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
import PeopleIcon from '@mui/icons-material/People'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../shared/auth/AuthProvider'

const drawerWidth = 240

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
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
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
                            Customer Management Application
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Management Portal
                        </Typography>
                    </Box>

                    <List sx={{ px: 1 }}>
                        <ListItemButton
                            component={NavLink}
                            to="/"
                            end
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
                                <PeopleIcon />
                            </ListItemIcon>

                            <ListItemText primary="Customers" />
                        </ListItemButton>

                    </List>

                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {user?.username} ({user?.role})
                        </Typography>
                        <Button fullWidth variant="outlined" onClick={handleLogout}>
                            Log out
                        </Button>
                        <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ mt: 2 }}
                        >
                            ● System connected
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