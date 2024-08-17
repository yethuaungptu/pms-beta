const express = require("express");
const router = express.Router();
const Classes = require("../models/Classes");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, async function (req, res) {
  const classes = await Classes.find({ status: true })
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  console.log(classes);
  res.render("class/index", { classes: classes });
});

router.post("/add", checkAccount, async function (req, res) {
  const classes = new Classes();
  classes.name = req.body.className;
  classes.createdBy = req.session.account.id;
  classes.updatedBy = req.session.account.id;
  const data = await classes.save();
  console.log(data);
  res.redirect("/classes");
});

router.post("/checkDup", checkAccount, async function (req, res) {
  const data = await Classes.findOne({ name: req.body.name });
  if (data != null) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
});

router.post("/update", checkAccount, async function (req, res) {
  const update = {
    name: req.body.className,
    updatedBy: req.session.account.id,
    updated: Date.now(),
  };
  const data = await Classes.findByIdAndUpdate(req.body.id, update);
  res.redirect("/classes");
});

router.get("/delete/:id", checkAccount, async function (req, res) {
  const update = {
    status: false,
    updated: Date.now(),
    updatedBy: req.session.account.id,
  };
  const data = await Classes.findByIdAndUpdate(req.params.id, update);
  res.redirect("/classes");
});

module.exports = router;
