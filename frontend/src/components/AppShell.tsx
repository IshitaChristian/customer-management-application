import { NavLink, Outlet } from 'react-router-dom'
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import SearchIcon from '@mui/icons-material/Search'

const drawerWidth = 240

function AppShell() {
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
                            to="/customers"
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

                        <ListItemButton
                            component={NavLink}
                            to="/customers/find"
                            sx={{
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
                                <SearchIcon />
                            </ListItemIcon>

                            <ListItemText primary="Find customer" />
                        </ListItemButton>
                    </List>

                    <Box sx={{ mt: 'auto', p: 2 }}>
                        <Typography
                            variant="body2"
                            color="success.main"
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