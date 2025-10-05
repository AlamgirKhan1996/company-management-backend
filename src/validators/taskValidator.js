// src/validators/taskValidator.js
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  dueDate: z.string().optional(),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
});
export const assignTaskToEmployeeSchema = z.object({
  employeeId: z.string().uuid(),
});