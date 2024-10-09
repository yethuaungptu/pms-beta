var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");

var indexRouter = require("./routes/index");
var contactRouter = require("./routes/contact");
var classRouter = require("./routes/classes");
var categoryRouter = require("./routes/category");
var itemRouter = require("./routes/item");
var stockAdjRouter = require("./routes/stockadj");
var importRouter = require("./routes/import");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "Pm$@2024!nF0Tech",
    resave: false,
    saveUninitialized: true,
  })
);

mongoose.connect("mongodb://127.0.0.1/pmsdb");
const db = mongoose.connection;
db.on("error", console.error.bind("Mongodb connection error at pmsdb"));

app.use(function (req, res, next) {
  res.locals.account = req.session.account;
  next();
});

app.use("/", indexRouter);
app.use("/contact", contactRouter);
app.use("/classes", classRouter);
app.use("/category", categoryRouter);
app.use("/item", itemRouter);
app.use("/stockadjustment", stockAdjRouter);
app.use("/import", importRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
