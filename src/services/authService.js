import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUserService = async (name, email, password, role) => {
  // Check if user already exists
  // NOTE: In multi-tenant mode, email is not globally unique.
  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return user;
};

export const loginUserService = async ({
  email,
  password,
  companyId,
  companyEmail,
}) => {
  let resolvedCompanyId = companyId;

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
    const matches = await prisma.user.findMany({
      where: { email },
      select: { id: true, email: true, password: true, role: true, companyId: true },
      take: 2,
    });

    if (matches.length === 0) throw new Error("User not found");
    if (matches.length > 1) {
      throw new Error("Multiple companies found for this email. Please provide companyEmail or companyId.");
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

  return { token };
};

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
    if (existingCompany) {
      throw new Error("Company already exists with this email");
    }

    const existingAdmin = await tx.user.findFirst({
      where: { email: adminEmail },
    });
    if (existingAdmin) {
      throw new Error("User already exists with this email");
    }

    const company = await tx.company.create({
      data: {
        name: companyName,
        email: companyEmail,
        phone,
        address,
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

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
