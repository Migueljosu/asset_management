const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asset Management API",
      version: "1.0.0",
      description: "API para gestão de equipamentos e ativos",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
    ],
    tags: [
      { name: "Auth", description: "Autenticação e tokens" },
      { name: "Users", description: "Gestão de utilizadores" },
      { name: "Equipment", description: "Gestão de equipamentos" },
      { name: "Schedule", description: "Agendamentos de equipamentos" },
      { name: "Loan", description: "Empréstimos de equipamentos" },
      { name: "Maintenance", description: "Gestão de manutenções" },
      { name: "Transfer", description: "Transferências entre setores" },
      { name: "Sector", description: "Gestão de setores/departamentos" },
      { name: "Anomaly", description: "Reporte e gestão de anomalias" },
      { name: "Notification", description: "Notificações do sistema" },
      { name: "Dashboard", description: "Estatísticas do dashboard" },
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
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
