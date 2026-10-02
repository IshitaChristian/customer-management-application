import axios, {
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiErrorResponse } from './apiError'
import { handleApiError } from './interceptors/apiErrorInterceptor'
import { AUTHENTICATION_EXPIRED_EVENT } from '../auth/authEvents'

const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ??
        'http://localhost:8080',

    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const url = error.config?.url ?? ''
        const isAuthenticationRequest = [
            '/api/v1/login',
            '/api/v1/logout',
            '/api/v1/auth/me',
        ].some((path) => url.endsWith(path))
        if (error.response?.status === 401 && !isAuthenticationRequest) {
            window.dispatchEvent(new Event(AUTHENTICATION_EXPIRED_EVENT))
        }
        return handleApiError(error)
    },
)

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (config.method && !['get', 'head', 'options'].includes(config.method)) {
            const { data } = await apiClient.get<{
                headerName: string
                token: string
            }>('/api/v1/csrf')
            config.headers.set(data.headerName, data.token)
        }

        return config
    },
)

export default apiClient