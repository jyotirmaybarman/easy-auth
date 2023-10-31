export type CreateUserType = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    password: string;
    email: string;
    verified?: boolean;
    verification_token?: string | null
}