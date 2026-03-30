// ─── src/routes/inviteRoutes.js ───────────────────────────────────────────────

import express from "express";
import {
  sendInvite,
  acceptInvite,
  getInvites,
  cancelInvite,
} from "../controllers/inviteController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin sends invite email
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  sendInvite
);

// Public — no auth needed (employee hasn't logged in yet)
router.post("/accept", acceptInvite);

// Get all pending invites for company
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  getInvites
);

// Cancel a pending invite
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  cancelInvite
);

export default router;


// ═══════════════════════════════════════════════════════════════════════
// ADD TO schema.prisma — Invite model
// ═══════════════════════════════════════════════════════════════════════
//
// model Invite {
//   id           String       @id @default(uuid())
//   email        String
//   role         String       @default("EMPLOYEE")
//   token        String       @unique
//   status       InviteStatus @default(PENDING)
//   expiresAt    DateTime
//   acceptedAt   DateTime?
//   companyId    String
//   company      Company      @relation(fields: [companyId], references: [id])
//   invitedById  String
//   invitedBy    User         @relation("SentInvites", fields: [invitedById], references: [id])
//   createdAt    DateTime     @default(now())
//   updatedAt    DateTime     @updatedAt
// }
//
// enum InviteStatus {
//   PENDING
//   ACCEPTED
//   CANCELLED
//   EXPIRED
// }
//
// Add to User model:
//   sentInvites  Invite[]  @relation("SentInvites")
//
// Add to Company model:
//   invites      Invite[]
//
// Then run: npx prisma db push && npx prisma generate
// ═══════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════
// ADD TO server.js / app.js
// ═══════════════════════════════════════════════════════════════════════
//
// import inviteRoutes from "./routes/inviteRoutes.js";
// app.use("/api/invite", inviteRoutes);
//
// ═══════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════
// ADD TO Railway environment variables:
// ═══════════════════════════════════════════════════════════════════════
//
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your-email@gmail.com
// SMTP_PASS=your-app-password        ← Gmail App Password (not regular password)
// FRONTEND_URL=https://your-vercel-app.vercel.app
//
// For Gmail App Password:
// Google Account → Security → 2FA enabled → App Passwords → Generate
// ═══════════════════════════════════════════════════════════════════════
