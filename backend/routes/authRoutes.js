const express = require("express");
const router = express.Router();

const {
  signupEmployee,
  signupCustomer,
  listPendingUsers,
  approveUser,
  rejectUser,
  setPasswordFirstTime,
  requestResetInfo,
  generateResetToken,
  resetPassword,
  login,
} = require("../controllers/authController");

// ==============================
// PUBLIC AUTH ROUTES
// ==============================

router.post("/signup/employee", signupEmployee);
router.post("/signup/customer", signupCustomer);

router.post("/login", login);

// Password / reset flows
router.post("/set-password-first", setPasswordFirstTime);
router.post("/reset/info", requestResetInfo);
router.post("/reset/generate-token", generateResetToken);
router.post("/reset/confirm", resetPassword);

// ==============================
// ADMIN-ORIENTED USER MGMT
// (Front-end will ensure only admins call these.)
// ==============================

router.get("/users/pending", listPendingUsers);
router.post("/users/:id/approve", approveUser);
router.post("/users/:id/reject", rejectUser);

module.exports = router;
