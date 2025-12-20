import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({
       error: (email) => email.input === undefined ? "Email es requerido"
                                                    : "Formato de email invalido" 
    }), 
    password: z
        .string('Contraseña requerida')
        .min(6, 'El password debe tene al menos 6 caracteres')
        .max(20, 'Password demasiado largo'),
});
