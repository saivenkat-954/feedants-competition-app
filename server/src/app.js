const express = require("express");
const submissionRoutes = require("./routes/submissionRoutes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const competitionRoutes = require("./routes/competitionRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Feedants API is running",
  });
});

app.use("/api/competitions", competitionRoutes);
app.use("/api/competitions", submissionRoutes);

module.exports = app;