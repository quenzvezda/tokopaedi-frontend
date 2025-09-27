import { z } from "zod";

type UserPage = {
    content: Array<User>;
    number?: /**
     * Zero-based page index
     */
    number | undefined;
    size?: number | undefined;
    totalElements?: number | undefined;
    totalPages?: number | undefined;
};;
type User = {
    id: string;
    username: string;
};;

const RegisterRequest = z.object({ username: z.string().min(3).max(32).describe("Username unik (huruf, angka, dot, underscore)"), email: z.string().max(120).email(), password: z.string().min(6).max(128), fullName: z.string().min(3).max(120).describe("Nama lengkap pelanggan"), phone: z.string().regex(/^(\+?[0-9]{8,15})$/).describe("Nomor telepon opsional (angka, boleh diawali '+')").nullish() }).passthrough();
const RegisterResponse = z.object({ message: z.string() }).passthrough();
const ApiError = z.object({ code: z.string().nullish(), message: z.string(), upstream: z.object({}).partial().passthrough().nullish() }).passthrough();
const LoginRequest = z.object({ usernameOrEmail: z.string(), password: z.string() }).passthrough();
const AccessTokenResponse = z.object({ tokenType: z.string(), accessToken: z.string(), expiresIn: z.number().int() }).passthrough();
const User: z.ZodType<User> = z.object({ id: z.string().uuid(), username: z.string() }).passthrough();
const UserPage: z.ZodType<UserPage> = z.object({ content: z.array(User), number: z.number().int().describe("Zero-based page index").optional(), size: z.number().int().optional(), totalElements: z.number().int().optional(), totalPages: z.number().int().optional() }).passthrough();

export const schemas = {
	RegisterRequest,
	RegisterResponse,
	ApiError,
	LoginRequest,
	AccessTokenResponse,
	User,
	UserPage,
};
