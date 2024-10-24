const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const StockAdj = require("../models/StockAdj");
const { findByIdAndDelete } = require("../models/Sale");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, async function (req, res) {
  const items = await Item.find({ status: true });
  const stockadjs = await StockAdj.find({}).populate("itemId", "name id");
  res.render("stockadj/index", { items: items, stockadjs: stockadjs });
});

router.get("/add/:id", checkAccount, async function (req, res) {
  const item = await Item.findById(req.params.id);
  res.render("stockadj/add", { item: item });
});

router.post("/add", checkAccount, async function (req, res) {
  const stockadj = new StockAdj();
  const updateItem = {
    quantity: req.body.orgquantity - req.body.redquantity,
    updated: Date.now(),
    updatedBy: req.session.account.id,
  };
  const data = await Item.findByIdAndUpdate(req.body.id, updateItem);
  stockadj.itemId = req.body.id;
  stockadj.originalQty = req.body.orgquantity;
  stockadj.reduceQty = req.body.redquantity;
  stockadj.remark = req.body.remark;
  stockadj.updatedBy = req.session.account.id;
  stockadj.createdBy = req.session.account.id;
  const result = await stockadj.save();
  res.redirect("/item/list");
});

router.post("/delete", checkAccount, async function (req, res) {
  try {
    const data = await Item.findByIdAndUpdate(req.body.itemId, {
      $inc: { quantity: req.body.qty },
    });
    const deleteInfo = await StockAdj.findByIdAndDelete(req.body.id);
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});
module.exports = router;
