import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import MESSAGES from '../../constants/messages'
import { ApiError, type ApiErrorResponse } from '../apiError'
import { handleApiError } from './apiErrorInterceptor'

function axiosErrorWithResponse(status: number, data: unknown) {
    const error = new AxiosError<ApiErrorResponse>('Request failed')
    Object.defineProperty(error, 'response', {
        value: { status, data },
    })
    return error
}

describe('handleApiError', () => {
    it('preserves the HTTP status and structured backend validation errors', () => {
        const error = axiosErrorWithResponse(400, {
            message: 'Validation failed',
            errors: { firstName: 'must not be blank' },
        })

        expect(() => handleApiError(error)).toThrowError(
            expect.objectContaining({
                status: 400,
                message: 'Validation failed',
                errors: { firstName: 'must not be blank' },
            }),
        )
    })

    it('returns a safe error when the server response is not JSON', () => {
        const error = axiosErrorWithResponse(502, '<html>upstream failure</html>')

        expect(() => handleApiError(error)).toThrowError(
            new ApiError(502, MESSAGES.common.unexpectedError),
        )
    })

    it('ignores malformed validation errors while preserving the response message', () => {
        const error = axiosErrorWithResponse(400, {
            message: 'Validation failed',
            errors: { firstName: 42 },
        })

        expect(() => handleApiError(error)).toThrowError(
            new ApiError(400, 'Validation failed'),
        )
    })

    it('returns a connection message when no response is received', () => {
        const error = new AxiosError<ApiErrorResponse>('Network Error')
        Object.defineProperty(error, 'request', { value: {} })

        expect(() => handleApiError(error)).toThrowError(
            new ApiError(0, MESSAGES.common.serverUnavailable),
        )
    })

    it('preserves the Axios message for errors without a response or request', () => {
        const error = new AxiosError<ApiErrorResponse>('Request setup failed')

        expect(() => handleApiError(error)).toThrowError(
            new ApiError(0, 'Request setup failed'),
        )
    })
})
