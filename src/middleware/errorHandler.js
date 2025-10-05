export const errorHandler = (err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors?.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
