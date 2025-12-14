import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Company Management API",
      version: "1.0.0",
      description: "API documentation for the Company Management System",
    },
    servers: [
      {
        servers: [
  {
    url: "http://localhost:5000/api",
    description: "Local Development",
  },
  {
    url: "https://company-management-backend-2.onrender.com/api",
    description: "Render Production",
  },
],

      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"], // Path to your route files
};

export const swaggerSpec = swaggerJsdoc(options);
