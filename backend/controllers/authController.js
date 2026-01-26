const bcrypt = require("bcryptjs");
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
    const { name, email, phone, country, place, securityQuestions } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    if (!Array.isArray(securityQuestions) || securityQuestions.length < 3) {
      return res.status(400).json({
        error: "Please select and answer at least 3 security questions",
      });
    }

    const [q1, q2, q3] = securityQuestions;
    const normalizeAnswer = (a) => (a || "").trim().toLowerCase();

    const answer1Hash = await bcrypt.hash(normalizeAnswer(q1?.answer), SALT_ROUNDS);
    const answer2Hash = await bcrypt.hash(normalizeAnswer(q2?.answer), SALT_ROUNDS);
    const answer3Hash = await bcrypt.hash(normalizeAnswer(q3?.answer), SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: "EMPLOYEE",
        phone: phone || null,
        country: country || null,
        place: place || null,
        status: "PENDING",
        securityQuestion1: q1?.question || null,
        securityAnswer1Hash: answer1Hash,
        securityQuestion2: q2?.question || null,
        securityAnswer2Hash: answer2Hash,
        securityQuestion3: q3?.question || null,
        securityAnswer3Hash: answer3Hash,
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
    const { name, email, phone, country, place, customerName, securityQuestions } = req.body;

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

    if (!Array.isArray(securityQuestions) || securityQuestions.length < 3) {
      return res.status(400).json({
        error: "Please select and answer at least 3 security questions",
      });
    }

    const [q1, q2, q3] = securityQuestions;
    const normalizeAnswer = (a) => (a || "").trim().toLowerCase();

    const answer1Hash = await bcrypt.hash(normalizeAnswer(q1?.answer), SALT_ROUNDS);
    const answer2Hash = await bcrypt.hash(normalizeAnswer(q2?.answer), SALT_ROUNDS);
    const answer3Hash = await bcrypt.hash(normalizeAnswer(q3?.answer), SALT_ROUNDS);

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
        securityQuestion1: q1?.question || null,
        securityAnswer1Hash: answer1Hash,
        securityQuestion2: q2?.question || null,
        securityAnswer2Hash: answer2Hash,
        securityQuestion3: q3?.question || null,
        securityAnswer3Hash: answer3Hash,
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
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

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
// ADMIN USER MANAGEMENT (LIST & ROLE UPDATES)
// ==============================

// List all users with basic fields so admin can review roles/access
exports.listAllUsers = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        customerName: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (err) {
    console.error("listAllUsers error", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update a user's role. Front-end will restrict this to admins only.
exports.updateUserRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    const allowedRoles = ["ADMIN", "EMPLOYEE", "CUSTOMER"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      customerName: updated.customerName,
    });
  } catch (err) {
    console.error("updateUserRole error", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// ==============================
// PASSWORD SET / RESET
// ==============================

exports.setPasswordFirstTime = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const updated = await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordHash: hash,
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
  // Deprecated: one-time token flow removed in favour of security questions
  return res
    .status(400)
    .json({ error: "Reset tokens are no longer supported" });
};

// Return configured security questions (without answers) for an approved user
exports.getSecurityQuestions = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.status !== "APPROVED") {
      return res.status(404).json({ error: "Approved user not found" });
    }

    const questions = [
      user.securityQuestion1,
      user.securityQuestion2,
      user.securityQuestion3,
    ].filter(Boolean);

    if (!questions.length) {
      return res.status(400).json({
        error:
          "Security questions are not configured for this user. Please contact the administrator.",
      });
    }

    res.json({ questions });
  } catch (err) {
    console.error("getSecurityQuestions error", err);
    res.status(500).json({ error: "Failed to load security questions" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, answers } = req.body;

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
    } else {
      // Fallback to security questions when old password is not provided
      const storedHashes = [
        user.securityAnswer1Hash,
        user.securityAnswer2Hash,
        user.securityAnswer3Hash,
      ].filter(Boolean);

      if (!Array.isArray(answers) || !answers.length || !storedHashes.length) {
        return res.status(400).json({
          error:
            "Security questions are required to reset your password. Please answer the configured questions.",
        });
      }

      const normalizedAnswers = answers.map((a) => (a || "").trim().toLowerCase());

      if (normalizedAnswers.length < storedHashes.length) {
        return res.status(400).json({
          error: "Please provide answers for all configured security questions.",
        });
      }

      // Compare each configured question's hash with the corresponding answer index
      for (let i = 0; i < storedHashes.length; i += 1) {
        const ok = await bcrypt.compare(normalizedAnswers[i], storedHashes[i]);
        if (!ok) {
          return res.status(400).json({ error: "Security answers did not match" });
        }
      }
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        passwordHash: hash,
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
