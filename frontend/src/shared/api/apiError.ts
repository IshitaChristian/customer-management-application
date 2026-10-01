export interface ApiErrorResponse {
    status: number
    message: string
    errors?: Record<string, string> | null
}

export class ApiError extends Error {
    status: number
    errors: Record<string, string> | null

    constructor(
        status: number,
        message: string,
        errors: Record<string, string> | null = null,
    ) {
        super(message)

        this.name = 'ApiError'
        this.status = status
        this.errors = errors
    }
}