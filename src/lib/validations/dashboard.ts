import { z } from 'zod';

/**
 * Schema para solicitud de servicio
 */
export const serviceRequestSchema = z.object({
  serviceType: z.enum([
    'plomeria',
    'electricidad',
    'carpinteria',
    'pintura',
    'limpieza',
    'albañileria',
    'herreria',
    'aire_acondicionado',
    'jardineria',
    'cerrajeria',
    'impermeabilizacion',
    'techos',
    'pisos',
    'ventanas',
    'puertas',
  ]),
  description: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .refine(
      (val) => !val.includes('<script>') && !val.includes('javascript:'),
      'La descripción contiene contenido no permitido'
    ),
  address: z
    .string()
    .min(10, 'Dirección inválida (mínimo 10 caracteres)')
    .max(200, 'Dirección demasiado larga'),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Teléfono debe tener entre 10 y 15 dígitos'),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  preferredDate: z.string().datetime().optional(),
});

export type ServiceRequest = z.infer<typeof serviceRequestSchema>;

/**
 * Schema para actualización de lead
 */
export const leadUpdateSchema = z.object({
  service: z.string().min(1, 'El servicio es requerido').max(100),
  description: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  whatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'WhatsApp debe tener entre 10 y 15 dígitos'),
  address: z.string().min(10).max(200).optional(),
  photos: z.array(z.string().url()).max(10, 'Máximo 10 fotos'),
});

export type LeadUpdate = z.infer<typeof leadUpdateSchema>;

/**
 * Schema para perfil de cliente
 */
export const clientProfileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Teléfono inválido').optional(),
  whatsapp: z.string().regex(/^[0-9]{10,15}$/, 'WhatsApp inválido').optional(),
  address: z.string().min(10).max(200).optional(),
  city: z.string().max(100).optional(),
});

export type ClientProfile = z.infer<typeof clientProfileSchema>;



