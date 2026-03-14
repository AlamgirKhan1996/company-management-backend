import {z} from "zod";

export const createCompanySchema = z.object({
  companyName: z.string().min(2).max(100),
  companyEmail: z.string().email(),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(2).max(100).optional(),
  companyEmail: z.string().email().optional(),
});