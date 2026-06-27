const express = require("express");
const bodyParser = require("body-parser");
const connect = require("./db");
require("dotenv").config();
const path = require("path");
const app = express();
const {CSEvalue, ECEvalue, MEAvalue, Mathvalue} = require('./config/config')
connect();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/"));
app.use('/katex', express.static(path.join(__dirname, 'node_modules/katex/dist')));
app.use('/mathjax', express.static(path.join(__dirname, 'node_modules/mathjax/es5')));

app.use("/question", require("./route/question"));
app.use("/user", require("./route/user"));
app.use("/admin", require("./route/admin"));
app.use("/admin/result", require("./route/result"));
app.use("/time", require("./route/timing"));

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
