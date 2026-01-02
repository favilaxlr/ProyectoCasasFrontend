import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({
       error: (email) => email.input === undefined ? "Email is required"
                                                    : "Invalid email format" 
    }), 
    password: z
        .string('Password required')
        .min(6, 'Password must be at least 6 characters')
        .max(20, 'Password too long'),
});
