import axios, {
    type AxiosResponse,
} from 'axios'
import { handleApiError } from './interceptors/apiErrorInterceptor'

const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ??
        'http://localhost:8080',

    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    handleApiError,
)

export default apiClient