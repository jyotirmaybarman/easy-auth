import z from "zod";

export type AuthResponseType<T> = Promise<{ success: true; message: string } & T | { success: false, errorCode: number; message: string | z.typeToFlattenedError<any> } & { [K in keyof T]?: undefined | null }>