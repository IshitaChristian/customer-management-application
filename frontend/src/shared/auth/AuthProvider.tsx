import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
    type AuthenticatedUser,
} from '../../domains/auth/api/authService'
import { ApiError } from '../api/apiError'
import { AuthContext } from './AuthContext'
import { AUTHENTICATION_EXPIRED_EVENT } from './authEvents'

const AUTHENTICATION_CHECK_ERROR =
    'Unable to check your sign-in status. Please try again.'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [authError, setAuthError] = useState<string | null>(null)
    const [checkAttempt, setCheckAttempt] = useState(0)

    useEffect(() => {
        let active = true

        const handleExpiredAuthentication = () => {
            setUser(null)
            setAuthError(null)
            setIsLoading(false)
        }
        window.addEventListener(
            AUTHENTICATION_EXPIRED_EVENT,
            handleExpiredAuthentication,
        )

        getCurrentUser()
            .then((currentUser) => {
                if (active) {
                    setUser(currentUser)
                    setAuthError(null)
                }
            })
            .catch((error: unknown) => {
                if (!active) {
                    return
                }
                setUser(null)
                setAuthError(
                    error instanceof ApiError && error.status === 401
                        ? null
                        : AUTHENTICATION_CHECK_ERROR,
                )
            })
            .finally(() => {
                if (active) setIsLoading(false)
            })

        return () => {
            active = false
            window.removeEventListener(
                AUTHENTICATION_EXPIRED_EVENT,
                handleExpiredAuthentication,
            )
        }
    }, [checkAttempt])

    const retryAuthenticationCheck = useCallback(() => {
        setIsLoading(true)
        setAuthError(null)
        setCheckAttempt((attempt) => attempt + 1)
    }, [])

    const login = useCallback(async (username: string, password: string) => {
        await loginRequest(username, password)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setAuthError(null)
    }, [])

    const logout = useCallback(async () => {
        try {
            await logoutRequest()
            setUser(null)
            setAuthError(null)
        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 401) {
                setUser(null)
            }
            throw error
        }
    }, [])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            authError,
            login,
            logout,
            retryAuthenticationCheck,
        }),
        [user, isLoading, authError, login, logout, retryAuthenticationCheck],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
