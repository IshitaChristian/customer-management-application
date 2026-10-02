import type { AxiosError } from 'axios'
import MESSAGES from '../../constants/messages'
import {
    ApiError,
    type ApiErrorResponse,
} from '../apiError'

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isErrorMap(value: unknown): value is Record<string, string> {
    return isRecord(value)
        && Object.values(value).every((item) => typeof item === 'string')
}

export function handleApiError(
    error: AxiosError<ApiErrorResponse>,
): never {
    if (error.response) {
        const responseData = isRecord(error.response.data)
            ? error.response.data
            : null

        throw new ApiError(
            error.response.status,
            typeof responseData?.message === 'string'
                ? responseData.message
                : MESSAGES.common.unexpectedError,
            isErrorMap(responseData?.errors) ? responseData.errors : null,
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