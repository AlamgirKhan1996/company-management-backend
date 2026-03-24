import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ─── Register a single user (used by /api/auth/register) ───────────────────
// NOTE: In multi-tenant mode email is NOT globally unique.
// This route is kept for dev/seed only. Production should use registerCompanyService.
export const registerUserService = async (name, email, password, role) => {
  // For multi-tenant we need a companyId, but this legacy endpoint has none.
  // Find the first company that already has a user with this email (prevent dups)
  // or just block globally duplicated emails as before.
  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  // We must attach the user to SOME company.
  // Find or create a "default" company so the NOT NULL constraint is satisfied.
  let company = await prisma.company.findFirst({
    where: { email: "default@company.local" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Default Company",
        email: "default@company.local",
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "EMPLOYEE",
      company: { connect: { id: company.id } },
    },
  });

  return user;
};

// ─── Login ──────────────────────────────────────────────────────────────────
// BUG FIXED: original code referenced `res` inside a service function.
// Services must NEVER touch req/res — they just return data.
export const loginUserService = async ({
  email,
  password,
  companyId,
  companyEmail,
}) => {
  let resolvedCompanyId = companyId;

  // Resolve company by email if companyId not provided
  if (!resolvedCompanyId && companyEmail) {
    const company = await prisma.company.findUnique({
      where: { email: companyEmail },
      select: { id: true },
    });
    if (!company) throw new Error("Company not found");
    resolvedCompanyId = company.id;
  }

  let user = null;

  if (resolvedCompanyId) {
    user = await prisma.user.findFirst({
      where: { email, companyId: resolvedCompanyId },
    });
  } else {
    // No company hint — try to find a unique match
    const matches = await prisma.user.findMany({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        companyId: true,
        name: true,
      },
      take: 2,
    });

    if (matches.length === 0) throw new Error("User not found");
    if (matches.length > 1) {
      throw new Error(
        "Multiple companies found for this email. Please provide companyEmail or companyId."
      );
    }
    user = matches[0];
  }

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return token and safe user data — the controller sets the cookie/response
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  };
};

// ─── Register Company + Super Admin ─────────────────────────────────────────
export const registerCompanyService = async ({
  companyName,
  companyEmail,
  phone,
  address,
  adminName,
  adminEmail,
  password,
}) => {
  return await prisma.$transaction(async (tx) => {
    const existingCompany = await tx.company.findUnique({
      where: { email: companyEmail },
    });
    if (existingCompany)
      throw new Error("Company already exists with this email");

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await tx.company.create({
      data: { name: companyName, email: companyEmail, phone, address },
    });

    // Check email uniqueness within the new company (it's a new company so always fine)
    const user = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        company: { connect: { id: company.id } },
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { company, user, token };
  });
};
