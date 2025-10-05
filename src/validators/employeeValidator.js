// src/validators/employeeValidator.js
import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  departmentId: z.string().uuid(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  departmentId: z.string().uuid().optional(),
});
export const assignTaskSchema = z.object({
  taskId: z.string().uuid(),
});