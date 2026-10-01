import type { AxiosError } from 'axios'
import MESSAGES from '../../constants/messages'
import {
    ApiError,
    type ApiErrorResponse,
} from '../apiError'

export function handleApiError(
    error: AxiosError<ApiErrorResponse>,
): never {
    if (error.response) {
        const {
            status,
            message,
            errors,
        } = error.response.data

        throw new ApiError(
            status,
            message ||
            MESSAGES.common.unexpectedError,
            errors ?? null,
        )
    }

    if (error.request) {
        throw new ApiError(
            0,
            MESSAGES.common.serverUnavailable,
        )
    }

    throw new ApiError(
        0,
        error.message ||
        MESSAGES.common.unexpectedError,
    )
}