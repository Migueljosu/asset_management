require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

// rota principal da API
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});