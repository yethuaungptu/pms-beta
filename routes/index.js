var express = require("express");
var router = express.Router();
const Account = require("../models/Account");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", checkAccount, function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/register", async function (req, res) {
  const admin = await Account.findOne({ role: "admin" });
  console.log(admin);
  if (admin == null) {
    res.render("register");
  } else {
    res.redirect("/login");
  }
});

router.post("/register", async function (req, res) {
  const account = new Account();
  account.name = req.body.name;
  account.email = req.body.email;
  account.password = req.body.password;
  account.role = "admin";
  account.position = "owner";
  const data = await account.save();
  console.log(data);
  res.redirect("/");
});

router.get("/blank", function (req, res) {
  res.render("blank");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", async function (req, res) {
  const account = await Account.findOne({ email: req.body.email });
  if (account != null && Account.compare(req.body.password, account.password)) {
    req.session.account = {
      id: account._id,
      email: account.email,
      name: account.name,
      role: account.role,
    };
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

module.exports = router;
