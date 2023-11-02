export type AuthResponseType<T> = {
    success: boolean
    message: string
    data?: {
        user?: T,
        access_token?: string,
        refresh_token?: string,
        verification_token?: string
    },
    errorCode?: number
}