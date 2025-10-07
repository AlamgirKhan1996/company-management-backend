// src/validators/projectValidator.js
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string(), // Expect date string, can parse later
  endDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  departmentIds: z.array(z.string().uuid().optional()).default([]),
  userId: z.string().uuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
});
export const assignProjectSchema = z.object({
  userId: z.string().uuid(),
});