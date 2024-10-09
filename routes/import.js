const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const Classes = require("../models/Classes");
const Item = require("../models/Item");
const Imports = require("../models/Import");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, async function (req, res) {
  const imports = await Imports.find({}).populate("supplierId", "supplierName");
  const suppliers = await Supplier.find({ status: true });
  const classes = await Classes.find({ status: true });
  res.render("import/index", {
    suppliers: suppliers,
    classes: classes,
    imports: imports,
  });
});

router.post("/getItem", checkAccount, async function (req, res) {
  const items = await Item.find({
    status: true,
    categoryId: req.body.categoryId,
  });
  console.log(items);
  res.json({ items: items });
});

router.post("/addItem", checkAccount, async function (req, res) {
  try {
    const imports = new Imports();
    imports.supplierId = req.body.supplierId;
    if (req.body.arrivalDate) imports.arrivalDate = req.body.arrivalDate;
    imports.totalAmount = req.body.totalPrice;
    imports.list = JSON.parse(req.body.itemList);
    imports.createdBy = req.session.account.id;
    imports.updatedBy = req.session.account.id;
    const data = await imports.save();
    for (var i = 0; i < data.list.length; i++) {
      let update = await Item.findByIdAndUpdate(data.list[i].itemId, {
        $inc: { quantity: data.list[i].quantity },
      });
    }
    res.json({ status: true });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/detail/:id", checkAccount, async function (req, res) {
  const importData = await Imports.findById(req.params.id)
    .populate("supplierId")
    .populate("list.itemId", "name");
  res.render("import/detail", { importData: importData });
});

module.exports = router;
