import { z } from 'zod';

const ProductSchema = z.object({
    id: z.string(),
    title: z.string().default(""),
    description: z.string().default(""),
    price: z.number().positive().default(0),
})

export type Product = z.infer<typeof ProductSchema>;