require("dotenv").config();

const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger")

const routes = require("./routes");

const app = express();

app.disable('etag');
app.use(cors());
app.use(express.json());

// rota principal da API
app.use("/api", routes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});