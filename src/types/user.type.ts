export type UserType = {
    id: string
    first_name: string
    middle_name: string | null
    last_name: string
    email:string
    new_email: string | null
    created_at: Date
    updated_at: Date
    password: string
    reset_token: string | null
    verified: boolean
    verification_token: string | null
}