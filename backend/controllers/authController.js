const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../prisma/client");

const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

// ==============================
// SIGNUP FLOWS
// ==============================

exports.signupEmployee = async (req, res) => {
  try {
    const { name, email, phone, country, place } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: "EMPLOYEE",
        phone: phone || null,
        country: country || null,
        place: place || null,
        status: "PENDING",
      },
    });

    res.status(201).json({ id: user.id, email: user.email, status: user.status, role: user.role });
  } catch (err) {
    console.error("signupEmployee error", err);
    res.status(500).json({ error: "Failed to sign up employee" });
  }
};

exports.signupCustomer = async (req, res) => {
  try {
    const { name, email, phone, country, place, customerName } = req.body;

    if (!name || !email || !customerName) {
      return res
        .status(400)
        .json({ error: "Name, email and customer name are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: "CUSTOMER",
        customerName,
        phone: phone || null,
        country: country || null,
        place: place || null,
        status: "PENDING",
      },
    });

    res.status(201).json({ id: user.id, email: user.email, status: user.status, role: user.role });
  } catch (err) {
    console.error("signupCustomer error", err);
    res.status(500).json({ error: "Failed to sign up customer" });
  }
};

// ==============================
// ADMIN APPROVAL FLOWS
// ==============================

exports.listPendingUsers = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    res.json(users);
  } catch (err) {
    console.error("listPendingUsers error", err);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { customerName } = req.body; // optional normalization

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: "APPROVED",
        customerName: customerName || undefined,
      },
    });

    res.json(user);
  } catch (err) {
    console.error("approveUser error", err);
    res.status(500).json({ error: "Failed to approve user" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    res.json(user);
  } catch (err) {
    console.error("rejectUser error", err);
    res.status(500).json({ error: "Failed to reject user" });
  }
};

// ==============================
// PASSWORD SET / RESET
// ==============================

exports.setPasswordFirstTime = async (req, res) => {
  try {
    const { email, password, resetToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "APPROVED") {
      return res.status(400).json({ error: "User is not approved" });
    }

    if (user.passwordHash) {
      return res.status(400).json({ error: "Password already set" });
    }

    if (resetToken) {
      if (!user.resetToken || user.resetToken !== resetToken) {
        return res.status(400).json({ error: "Invalid reset token" });
      }
      if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const updated = await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ id: updated.id, email: updated.email, role: updated.role });
  } catch (err) {
    console.error("setPasswordFirstTime error", err);
    res.status(500).json({ error: "Failed to set password" });
  }
};

exports.requestResetInfo = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      // do not reveal if user exists – generic response
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      status: user.status,
      hasPassword: !!user.passwordHash,
    });
  } catch (err) {
    console.error("requestResetInfo error", err);
    res.status(500).json({ error: "Failed to process reset request" });
  }
};

exports.generateResetToken = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "APPROVED") {
      return res.status(400).json({ error: "User is not approved" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    // In a later phase, this token can be emailed. For now we just return it so admin/UI can show it securely.
    res.json({ resetToken: token, expiresAt: expires });
  } catch (err) {
    console.error("generateResetToken error", err);
    res.status(500).json({ error: "Failed to generate reset token" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, resetToken } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "APPROVED") {
      return res.status(400).json({ error: "User is not approved" });
    }

    // Prefer oldPassword if provided
    if (oldPassword) {
      if (!user.passwordHash) {
        return res.status(400).json({ error: "Password not set yet" });
      }
      const match = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
    } else if (resetToken) {
      if (!user.resetToken || user.resetToken !== resetToken) {
        return res.status(400).json({ error: "Invalid reset token" });
      }
      if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
        return res.status(400).json({ error: "Reset token has expired" });
      }
    } else {
      return res.status(400).json({ error: "Old password or reset token is required" });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("resetPassword error", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// ==============================
// LOGIN
// ==============================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.status === "PENDING") {
      return res.status(403).json({ error: "Your account is pending approval" });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({ error: "Your account has been rejected" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: "Password not set yet" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // For now, return basic user info; token/session can be added later.
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      customerName: user.customerName,
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Failed to login" });
  }
};
