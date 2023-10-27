import { ColumnType, Generated } from 'kysely'

export interface Database {
  users: UserTable
}

export interface UserTable {
  id?: Generated<string>
  first_name: string
  middle_name?: string
  last_name: string
  email:string
  created_at?: ColumnType<Date, string | undefined, never>
  updated_at?: ColumnType<Date, string | undefined, never>
  password: string
  reset_token?: string
  verified?: boolean
  verification_token?: string
}