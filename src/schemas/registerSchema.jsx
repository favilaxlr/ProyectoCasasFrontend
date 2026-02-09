import { z } from 'zod';
import { DEFAULT_MAX_NOTIFICATION_CITIES, DEFAULT_MIN_NOTIFICATION_CITIES } from '../utils/notificationCities';

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
    notificationCities: z
        .array(z.string('Notification city required'))
        .min(DEFAULT_MIN_NOTIFICATION_CITIES, `Select at least ${DEFAULT_MIN_NOTIFICATION_CITIES} city`)
        .max(DEFAULT_MAX_NOTIFICATION_CITIES, `You can select up to ${DEFAULT_MAX_NOTIFICATION_CITIES} cities`)
        .refine((cities) => new Set(cities).size === cities.length, 'Cities must be unique'),
        
    password: z
        .string('Password required')
        .min(6, 'Password must be at least 6 characters')
        .max(20, 'Password too long'),

        confirm: z
            .string('Confirm password')
            .min(6, 'Confirmation must be at least 6 characters'),

        termsAccepted: z.literal(true, {
            errorMap: () => ({ message: 'You must agree to the Terms of Service and Privacy Policy.' })
        }),

        smsConsent: z.literal(true, {
            errorMap: () => ({ message: 'You must provide SMS consent to receive appointment updates.' })
        })
})
    .refine((data) => data.password === data.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });