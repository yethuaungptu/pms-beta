const express = require("express");
const router = express.Router();
const Classes = require("../models/Classes");
const Categories = require("../models/Category");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, async function (req, res) {
  const classes = await Classes.find({ status: true });
  const categories = await Categories.find({ status: true })
    .populate("cname", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  res.render("category/index", { classes: classes, categories: categories });
});

router.post("/checkDup", checkAccount, async function (req, res) {
  const category = await Categories.findOne({
    cname: req.body.cname,
    category: req.body.category,
  });
  if (category != null) res.json({ status: true });
  else res.json({ status: false });
});

router.post("/add", checkAccount, async function (req, res) {
  const category = new Categories();
  category.cname = req.body.cname;
  category.category = req.body.category;
  category.createdBy = req.session.account.id;
  category.updatedBy = req.session.account.id;
  const data = await category.save();
  res.redirect("/category");
});

router.post("/update", checkAccount, async function (req, res) {
  const update = {
    cname: req.body.cname,
    category: req.body.category,
    updatedBy: req.session.account.id,
    updated: Date.now(),
  };
  const data = await Categories.findByIdAndUpdate(req.body.id, update);
  res.redirect("/category");
});

router.get("/delete/:id", checkAccount, async function (req, res) {
  const update = {
    status: false,
    updateBy: req.session.account.id,
    updated: Date.now(),
  };
  const data = await Categories.findByIdAndUpdate(req.params.id, update);
  res.redirect("/category");
});
module.exports = router;
