const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./backend/db");
require("dotenv").config();
const path = require("path");
const app = express();
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('./backend/config/config')
connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve React bundle build static files
app.use(express.static(path.join(__dirname, "frontend/dist")));
// Serve uploads attachment files
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));
app.use('/katex', express.static(path.join(__dirname, 'node_modules/katex/dist')));
app.use('/mathjax', express.static(path.join(__dirname, 'node_modules/mathjax/es5')));

app.use("/question", require("./backend/route/question"));
app.use("/user", require("./backend/route/user"));
app.use("/admin", require("./backend/route/admin"));
app.use("/admin/result", require("./backend/route/result"));
app.use("/time", require("./backend/route/timing"));

// Config variables API
app.get("/api/config", (req, res) => {
  res.json({ CSEvalue, ECEvalue, MEAvalue, Mathvalue });
});

// React Router SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const port = process.env.PORT || 3000;
const host = process.env.IP || "0.0.0.0";
const displayHost = host === "0.0.0.0" ? "localhost" : host;

app.listen(port, host, () => {
  console.log(`\n=============================================================`);
  console.log(`  EXAM PORTAL - BACKEND API SERVER STARTED`);
  console.log(`=============================================================`);
  console.log(`  [BACKEND] Running on Port:   ${port}`);
  console.log(`  [BACKEND] API Base URL:      http://${displayHost}:${port}`);
  console.log(`  [DEVELOPMENT] Run frontend in a separate terminal:`);
  console.log(`                cd frontend && npm run dev (or npm run frontend:dev from root)`);
  console.log(`=============================================================\n`);
});
