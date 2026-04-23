const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Equipment" },
    { name: "Schedule" },
    { name: "Loan" },
    { name: "Maintenance" },
    { name: "Transfer" },
  ],
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asset Management API",
      version: "1.0.0",
      description: "API para gestão de equipamentos",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // onde estão as docs
};

module.exports = swaggerJsdoc(options);
