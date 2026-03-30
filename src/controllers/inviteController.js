// ─── src/controllers/inviteController.js ─────────────────────────────────────

import prisma from "../utils/prismaClient.js";
import { Resend } from "resend";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

// ─── Mailer setup ─────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Send invite email ────────────────────────────────────────────────────────
async function sendInviteEmail({ to, inviterName, companyName, role, inviteUrl }) {
  const roleLabel = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
  }[role] || role;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
        You're invited to join ${companyName}
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
        ${inviterName} has invited you as <strong style="color:#c4b5fd;">${roleLabel}</strong>
      </p>
    </div>

    <div style="padding:32px 40px;">
      <p style="color:#374151;font-size:15px;line-height:1.6;">
        Click the button below to set up your account and get started.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">
          Accept Invitation →
        </a>
      </div>

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
        <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
          <strong style="color:#374151;">Role:</strong> ${roleLabel}<br>
          <strong style="color:#374151;">Company:</strong> ${companyName}<br>
          <strong style="color:#374151;">Invited by:</strong> ${inviterName}
        </p>
      </div>

      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
        This invite link expires in <strong>48 hours</strong>.
        If you didn't expect this, ignore this email.
      </p>
    </div>

    <div style="padding:20px 40px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        If button doesn't work, copy this link:<br>
        <span style="color:#6b7280;">${inviteUrl}</span>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to,
    subject: `You're invited to join ${companyName} on CMS`,
    html,
  });
}

// ─── POST /api/invite — Admin sends invite ────────────────────────────────────
export const sendInvite = async (req, res) => {
  try {
    const { email, role = "EMPLOYEE" } = req.body;
    const companyId = req.companyId || req.user.companyId;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if user already exists in this company
    const existing = await prisma.user.findFirst({
      where: { email, companyId },
    });
    if (existing) {
      return res.status(409).json({ error: "User with this email already exists in your company" });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Check if pending invite already exists — update it
    const existingInvite = await prisma.invite.findFirst({
      where: { email, companyId, status: "PENDING" },
    });

    if (existingInvite) {
      await prisma.invite.update({
        where: { id: existingInvite.id },
        data: { token, expiresAt: expires, role },
      });
    } else {
      await prisma.invite.create({
        data: {
          email,
          role,
          token,
          expiresAt: expires,
          companyId,
          invitedById: req.user.id,
          status: "PENDING",
        },
      });
    }

    // Load company + inviter info for email
    const [company, inviter] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
      prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, email: true } }),
    ]);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

    await sendInviteEmail({
      to: email,
      inviterName: inviter?.name || inviter?.email || "Your Admin",
      companyName: company?.name || "Company",
      role,
      inviteUrl,
    });

    logger.info(`✅ Invite sent to ${email} for company ${companyId} with role ${role}`);
    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (err) {
    logger.error(`❌ Send invite error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/invite/accept — Employee accepts invite ────────────────────────
export const acceptInvite = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: "Token, name and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Find valid invite
    const invite = await prisma.invite.findFirst({
      where: {
        token,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    if (!invite) {
      return res.status(400).json({
        error: "Invite link is invalid or has expired. Please ask your admin to resend.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user account
    const user = await prisma.user.create({
      data: {
        email: invite.email,
        name,
        password: hashedPassword,
        role: invite.role,
        companyId: invite.companyId,
      },
    });

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    logger.info(`✅ Invite accepted: ${user.email} joined ${invite.company.name} as ${invite.role}`);
    res.status(200).json({
      message: "Account created successfully. You can now log in.",
      email: user.email,
      companyName: invite.company.name,
    });
  } catch (err) {
    logger.error(`❌ Accept invite error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/invite — List pending invites ───────────────────────────────────
export const getInvites = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;

    const invites = await prisma.invite.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    });

    res.status(200).json(invites);
  } catch (err) {
    logger.error(`❌ Get invites error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE /api/invite/:id — Cancel invite ───────────────────────────────────
export const cancelInvite = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    await prisma.invite.updateMany({
      where: { id: req.params.id, companyId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    res.status(200).json({ message: "Invite cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
