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
  password: z.string().min(6, "Password must be at least 6 characters", { message: "Password is required" }),
  companyId: z.string().uuid().optional(),
  companyEmail: z.string().email("Invalid company email").optional(),
});

// Company registration validation
export const registerCompanySchema = z.object({
  companyName: z.string().min(2, "Company name too short"),
  companyEmail: z
    .string()
    .email("Invalid email")
    .refine(isRealEmail, "Please use a real business email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminName: z.string().min(2, "Name too short"),
  adminEmail: z
    .string()
    .email("Invalid email")
    .refine(isRealEmail, "Please use a real email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ✅ Blocked fake domains
const BLOCKED_DOMAINS = [
  "example.com", "example.org", "example.net",
  "test.com", "fake.com", "abc.com", "mailinator.com",
  "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "trashmail.com",
];

function isRealEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (BLOCKED_DOMAINS.includes(domain)) return false;
  // Must have a real TLD (at least 2 chars)
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) return false;
  return true;
}

export const inviteSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .refine(isRealEmail, "Please use a real email address"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
});