import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createTransactionSchema = z.object({
  amount: z.coerce.number().positive().finite(),
  type: z.enum(["income", "expense"]),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must be <= 100 chars"),
  date: z
    .string()
    .trim()
    .regex(dateRegex, "Date must be in YYYY-MM-DD format"),
  notes: z.string().trim().max(500).optional().nullable()
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

