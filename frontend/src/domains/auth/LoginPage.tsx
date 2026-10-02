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
import { useAuth } from '../../shared/auth/AuthProvider'

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
        } catch {
            setError('Unable to sign in. Check your username and password.')
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
            <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Sign in
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                Customer Management Application
                            </Typography>
                        </Box>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label="Username"
                            autoComplete="username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                            autoFocus
                        />
                        <TextField
                            label="Password"
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
                            Sign in
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}

export default LoginPage
