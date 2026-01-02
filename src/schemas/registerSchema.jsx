import { z } from 'zod';

export const registerSchema = z.object({
    username: z
        .string('Username required')
        .min(5, 'Username must be at least 5 characters')
        .max(20, 'Username cannot be more than 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    email:z.email({
        error: (email) => email.input === undefined ? "Email is required"
                                                    : "Invalid email format"
    }),
    
    phone: z
        .string('Phone required')
        .min(1, 'Phone is required')
        .refine((value) => {
            // Validar formato internacional E.164 (+[codigo_pais][numero])
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            return phoneRegex.test(value);
        }, 'Please select a country and enter a valid number'),
        
    password: z
        .string('Password required')
        .min(6, 'Password must be at least 6 characters')
        .max(20, 'Password too long'),

        confirm: z
            .string('Confirm password')
            .min(6, 'Confirmation must be at least 6 characters')
})
    .refine((data) => data.password === data.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });