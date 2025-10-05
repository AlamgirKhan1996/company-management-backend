// src/validators/departmentValidator.js
import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
});
export const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
});