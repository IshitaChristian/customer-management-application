import { useState, type FormEvent } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiError'
import { useAuth } from '../../../../shared/auth/useAuth'
import {
    LOGIN_CARD_MAX_WIDTH,
    LOGIN_PAGE_COPY,
} from './LoginPage.constants'

function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setIsPending(true)
        try {
            await login(username, password)
            navigate('/customers', { replace: true })
        } catch (loginError: unknown) {
            setError(
                loginError instanceof ApiError && loginError.status === 401
                    ? LOGIN_PAGE_COPY.authenticationFailed
                    : loginError instanceof Error
                        ? loginError.message
                        : LOGIN_PAGE_COPY.signInUnavailable,
            )
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                p: 2,
                backgroundColor: 'background.default',
            }}
        >
            <Card
                variant="outlined"
                sx={{ width: '100%', maxWidth: LOGIN_CARD_MAX_WIDTH }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {LOGIN_PAGE_COPY.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                {LOGIN_PAGE_COPY.description}
                            </Typography>
                        </Box>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label={LOGIN_PAGE_COPY.username}
                            autoComplete="username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                            autoFocus
                        />
                        <TextField
                            label={LOGIN_PAGE_COPY.password}
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isPending}
                            startIcon={isPending ? <CircularProgress size={16} /> : undefined}
                        >
                            {LOGIN_PAGE_COPY.submit}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}

export default LoginPage
