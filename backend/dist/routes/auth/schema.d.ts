import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    senha: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=schema.d.ts.map