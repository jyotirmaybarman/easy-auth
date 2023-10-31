export type UserType = {
    id: string
    first_name: string
    middle_name: string
    last_name: string
    email:string
    created_at: Date
    updated_at: Date
    password: string
    reset_token: string | null
    verified: boolean
    verification_token: string | null
}