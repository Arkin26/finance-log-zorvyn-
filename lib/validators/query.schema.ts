import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const transactionTypeEnum = z.enum(["income", "expense"]);

export const transactionQuerySchema = z
  .object({
    type: transactionTypeEnum.optional(),
    category: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    date_from: z
      .string()
      .trim()
      .regex(dateRegex, "date_from must be in YYYY-MM-DD format")
      .optional(),
    date_to: z
      .string()
      .trim()
      .regex(dateRegex, "date_to must be in YYYY-MM-DD format")
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort_by: z.enum(["date", "amount"]).default("date"),
    order: z.enum(["asc", "desc"]).default("desc")
  })
  .superRefine((val, ctx) => {
    if (val.date_from && val.date_to && val.date_from > val.date_to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "date_from must be <= date_to",
        path: ["date_to"]
      });
    }
  });

export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;

