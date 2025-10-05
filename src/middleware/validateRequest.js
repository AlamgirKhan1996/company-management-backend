// src/middleware/validateRequest.js
import { z } from "zod";
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
        const formattedErrors = error.issues?.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })) || [];
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    // Handle unexpected errors
    console.error("Validation middleware error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error: err.message });
  }
}
