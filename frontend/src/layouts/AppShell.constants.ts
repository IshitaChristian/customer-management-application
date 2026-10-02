import PeopleIcon from '@mui/icons-material/People'

export const APP_SHELL_DRAWER_WIDTH = 240

export const APP_SHELL_COPY = {
    title: 'Customer Management Application',
    subtitle: 'Management Portal',
    customers: 'Customers',
    logout: 'Log out',
    systemStatus: '● System connected',
} as const

export const APP_SHELL_NAVIGATION = [
    {
        label: APP_SHELL_COPY.customers,
        to: '/',
        end: true,
        Icon: PeopleIcon,
    },
] as const
