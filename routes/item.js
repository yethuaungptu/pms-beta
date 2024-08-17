const express = require("express");
const router = express.Router();
const Classes = require("../models/Classes");
const Categories = require("../models/Category");
const Item = require("../models/Item");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/add", checkAccount, async function (req, res) {
  const classes = await Classes.find({ status: true });
  res.render("item/index", { classes: classes });
});

router.post("/getCategory", checkAccount, async function (req, res) {
  const categories = await Categories.find({
    cname: req.body.cid,
    status: true,
  });
  res.json({ categories: categories });
});

router.post("/additem", checkAccount, async function (req, res) {
  const data = await Item.findOne({ id: req.body.id });
  if (data != null) {
    res.json({ status: false, msg: "Item ID is duplicated" });
  } else {
    const item = new Item();
    const unitData = JSON.parse(req.body.unitObj);
    item.name = req.body.name;
    item.id = req.body.id;
    item.quantity = req.body.quantity;
    item.classId = req.body.classId;
    item.categoryId = req.body.category;
    item.price = req.body.price;
    item.expDate = req.body.expdate;
    item.isUnit = req.body.isUnit;
    if (req.body.isUnit == "true") {
      item.unit = unitData;
    }
    const insertData = await item.save();
    console.log(insertData);
    res.json({ status: true });
  }
});

router.post("/getItemId", checkAccount, async function (req, res) {
  const itemCount = await Item.countDocuments({
    categoryId: req.body.categoryId,
  });
  res.json({ itemCount: itemCount });
});

router.get("/list", checkAccount, async function (req, res) {
  const items = await Item.find({ status: true })
    .populate("classId", "name")
    .populate("categoryId", "category")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  const classes = await Classes.find({ status: true });
  console.log(items);
  res.render("item/list", { items: items, classes: classes });
});

router.post("/update", checkAccount, async function (req, res) {
  const update = {
    name: req.body.name,
    quantity: req.body.quantity,
    price: req.body.price,
    expDate: req.body.expdate,
  };
  const data = await Item.findByIdAndUpdate(req.body.itemId, update);
  res.redirect("/item/list");
});

router.get("/delete/:id", checkAccount, async function (req, res) {
  const update = {
    status: false,
  };
  const data = await Item.findByIdAndUpdate(req.params.id, update);
  res.redirect("/item/list");
});

module.exports = router;
