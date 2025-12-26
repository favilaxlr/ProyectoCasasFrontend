import { z } from 'zod';

export const registerSchema = z.object({
    username: z
        .string('Nombre de usuario requerido')
        .min(5, 'El nombre de usuario debe tener al menos 5 caracteres')
        .max(20, 'El nombre de usuario no puede tener mas de 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras numeros y guiones bajos'),

    email:z.email({
        error: (email) => email.input === undefined ? "Email es requerido"
                                                    : "Formato de email invalido"
    }),
    
    phone: z
        .string('Teléfono requerido')
        .min(1, 'El teléfono es requerido')
        .refine((value) => {
            // Validar formato internacional E.164 (+[codigo_pais][numero])
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            return phoneRegex.test(value);
        }, 'Por favor selecciona un país y ingresa un número válido'),
        
    password: z
        .string('Contraseña requerida')
        .min(6, 'El password debe tener al menos 6 caracteres')
        .max(20, 'Password demasiado largo'),

        confirm: z
            .string('Confirma la contraseña')
            .min(6, 'La confirmacion debe tener al menos 6 caracteres')
})
    .refine((data) => data.password === data.confirm, {
        message: "Las contraseñas no coinciden",
        path: ["confirm"],
    });