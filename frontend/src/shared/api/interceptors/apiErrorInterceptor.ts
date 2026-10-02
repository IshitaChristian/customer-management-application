import type { AxiosError } from 'axios'
import MESSAGES from '../../constants/messages'
import {
    ApiError,
    type ApiErrorResponse,
} from '../apiError'

function isErrorMap(value: unknown): value is Record<string, string> {
    return value !== null
        && typeof value === 'object'
        && !Array.isArray(value)
        && Object.values(value).every((item) => typeof item === 'string')
}

export function handleApiError(
    error: AxiosError<ApiErrorResponse>,
): never {
    if (error.response) {
        const responseData = error.response.data
        const message =
            responseData !== null
                && typeof responseData === 'object'
                && 'message' in responseData
                && typeof responseData.message === 'string'
                ? responseData.message
                : MESSAGES.common.unexpectedError
        const responseErrors =
            responseData !== null
                && typeof responseData === 'object'
                && 'errors' in responseData
                ? responseData.errors
                : undefined

        throw new ApiError(
            error.response.status,
            message,
            isErrorMap(responseErrors) ? responseErrors : null,
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