import { z } from "zod";

// Register validation
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"]),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyId: z.string().uuid().optional(),
  companyEmail: z.string().email("Invalid company email").optional(),
});

// Company registration validation
export const registerCompanySchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  companyEmail: z.string().email("Invalid company email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminName: z.string().min(3, "Admin name must be at least 3 characters"),
  adminEmail: z.string().email("Invalid admin email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
