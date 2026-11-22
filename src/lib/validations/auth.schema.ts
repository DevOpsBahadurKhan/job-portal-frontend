import { z } from "zod";

// Login schema
export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .pipe(z.email("Please enter a valid email address")),

    password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Full name is required")
            .max(100, "Name cannot exceed 100 characters"),

        email: z
            .string()
            .trim()
            .min(1, "Email is required")
            .pipe(z.email("Please enter a valid email address")),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password"),

        role: z.enum(["CANDIDATE", "RECRUITER"]),

        terms: z
            .boolean()
            .refine((value) => value === true, {
                message: "You must accept the Terms of Service",
            }),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export type RegisterFormValues = z.infer<typeof registerSchema>;