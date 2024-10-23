const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Sale = require("../models/Sale");
var moment = require("moment-timezone");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, async function (req, res) {
  var now = new Date();
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("day").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("day").format();
  const sales = await Sale.find({ created: { $gte: starttz, $lte: endtz } });
  res.render("sale/index", { sales: sales });
});

router.get("/salevoucher", checkAccount, async function (req, res) {
  const items = await Item.find({ status: true })
    .populate("classId", "name")
    .populate("categoryId", "category");
  res.render("sale/salevoucher", { items: items });
});

router.post("/add", checkAccount, async function (req, res) {
  try {
    const sale = new Sale();
    var now = new Date();
    const starttz = moment.utc(now).tz("Asia/Yangon").startOf("day").format();
    const endtz = moment.utc(now).tz("Asia/Yangon").endOf("day").format();
    const saleCount = await Sale.countDocuments({
      created: { $gte: starttz, $lte: endtz },
    });
    console.log(JSON.parse(req.body.items));
    sale.slipNo = saleCount + 1;
    sale.paidBy = req.body.paidBy;
    sale.dateStr = req.body.dateStr;
    sale.cashierId = req.body.cashierId;
    sale.tax = req.body.tax;
    sale.totalAmount = req.body.totalAmount;
    sale.grandAmount = req.body.grandAmount;
    sale.paidAmount = req.body.paidAmount;
    sale.refundAmount =
      Number(req.body.paidAmount) - Number(req.body.grandAmount);
    sale.list = JSON.parse(req.body.items);
    const data = await sale.save();
    for (var i = 0; i < data.list.length; i++) {
      let update = await Item.findByIdAndUpdate(data.list[i].itemId, {
        $inc: { quantity: -data.list[i].qty },
      });
    }
    res.json({ status: true, id: data._id });
  } catch (e) {
    console.log(e);
    res.json({ status: false });
  }
});

router.get("/voucherDetail/:id", checkAccount, async function (req, res) {
  const sale = await Sale.findById(req.params.id)
    .populate("list.itemId", "name")
    .populate("cashierId", "name");
  console.log(sale);
  res.render("sale/voucherDetail", { sale: sale });
});

module.exports = router;
