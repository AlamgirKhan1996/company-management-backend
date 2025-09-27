const express = require("express");
const { createDepartment, getDepartments } = require("../controllers/departmentController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Only Admin can create departments
router.post("/", authenticate, authorize(["admin"]), createDepartment);

// ✅ Any logged-in user can view departments
router.get("/", authenticate, getDepartments);

module.exports = router;
