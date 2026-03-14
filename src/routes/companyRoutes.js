import express from "express";
import { createCompany, getCompanyById, getCompanies, updateCompany, deleteCompany } from "../controllers/companyController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createCompanySchema, updateCompanySchema } from "../validators/companyValidator.js"; 
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

router.post("/", validate(createCompanySchema), logActivity("CREATE_COMPANY", "Company", (req) => `Created company: ${req.body.name}`), createCompany);
router.get("/", authenticate, authorize(["ADMIN"]), logActivity("GET_ALL_COMPANIES", "Company"), getCompanies);
router.get("/:id", authenticate, authorize(["ADMIN"]), logActivity("GET_COMPANY", "Company", (req) => `Fetched company: ${req.params.id}`), getCompanyById);
router.put("/:id", authenticate, authorize(["ADMIN"]), validate(updateCompanySchema), logActivity("UPDATE_COMPANY", "Company", (req) => `Updated company: ${req.body.name}`), updateCompany);
router.delete("/:id", authenticate, authorize(["ADMIN"]), logActivity("DELETE_COMPANY", "Company", (req) => `Deleted company: ${req.params.id}`), deleteCompany);

export default router;