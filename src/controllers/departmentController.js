const prisma = require("../config/prismaClient");

// ✅ Create Department (Admin only)
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    const department = await prisma.department.create({
      data: { name },
    });

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDepartment, getDepartments };
