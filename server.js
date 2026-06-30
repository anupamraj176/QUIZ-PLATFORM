const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./backend/db");
require("dotenv").config();
const path = require("path");
const app = express();
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('./backend/config/config')
connect();

app.set("views", path.join(__dirname, "frontend/views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads")));
app.use('/katex', express.static(path.join(__dirname, 'node_modules/katex/dist')));
app.use('/mathjax', express.static(path.join(__dirname, 'node_modules/mathjax/es5')));

app.use("/question", require("./backend/route/question"));
app.use("/user", require("./backend/route/user"));
app.use("/admin", require("./backend/route/admin"));
app.use("/admin/result", require("./backend/route/result"));
app.use("/time", require("./backend/route/timing"));

app.get("/quiz", (req, res) => {
  res.render("quiz",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/data", (req, res) => {
  res.render("userdetail",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/addquiz", (req, res) => {
  res.render("question.ejs",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/submitform", (req, res) => {
  res.render("UserSubmitForm.ejs",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/participants", (req, res) => {
  res.render("participant.ejs",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/instruction", (req, res) => {
  res.render("instruction",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/admin", (req, res) => {
  res.render("admin",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.get("/", (req, res) => {
  res.render("index",{CSEvalue, ECEvalue, MEAvalue, Mathvalue});
});

app.listen(process.env.PORT, process.env.IP , () => {
  console.log("server start at " + process.env.PORT);
});
