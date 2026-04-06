import { z } from "zod";

export const userRoleEnum = z.enum(["viewer", "analyst", "admin"]);
export const userStatusEnum = z.enum(["active", "inactive"]);

export const createUserSchema = z.object({
  email: z.string().email().trim(),
  full_name: z.string().trim().min(2).max(100),
  role: userRoleEnum,
  password: z.string().min(8).trim(),
  status: userStatusEnum.optional().default("active")
});

export const updateUserSchema = z
  .object({
    role: userRoleEnum.optional(),
    status: userStatusEnum.optional()
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: "At least one field must be provided"
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

