const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
var moment = require("moment-timezone");
const Item = require("../models/Item");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", checkAccount, function (req, res) {
  res.render("report/index");
});

router.get("/getSaleList", checkAccount, async function (req, res) {
  let query = {};
  if (req.query.start) {
    const starttz = moment
      .utc(new Date(req.query.start))
      .tz("Asia/Yangon")
      .startOf("day")
      .format();
    const endtz = moment
      .utc(new Date(req.query.end))
      .tz("Asia/Yangon")
      .startOf("day")
      .format();
    query = { created: { $gte: starttz, $lte: endtz } };
  }
  const data = await Sale.find(query).populate("cashierId", "name");
  console.log(data);
  res.json({ data: data });
});

router.get("/daily", checkAccount, async function (req, res) {
  var now = new Date();
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("day").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("day").format();
  const result = await Sale.find({ created: { $gte: starttz, $lte: endtz } });

  let qtyCount = 0;
  let saleAmount = 0;
  result.map((item) => {
    saleAmount += item.grandAmount;
    item.list.map((innerItem) => {
      qtyCount += innerItem.qty;
    });
  });
  console.log(result, qtyCount, saleAmount);
  res.render("report/daily", { qtyCount: qtyCount, saleAmount: saleAmount });
});

router.get("/weekly", checkAccount, async function (req, res) {
  var now = new Date();
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("week").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("week").format();
  const result = await Sale.find({ created: { $gte: starttz, $lte: endtz } });

  let qtyCount = 0;
  let saleAmount = 0;
  result.map((item) => {
    saleAmount += item.grandAmount;
    item.list.map((innerItem) => {
      qtyCount += innerItem.qty;
    });
  });
  console.log(result, qtyCount, saleAmount);
  res.render("report/weekly", { qtyCount: qtyCount, saleAmount: saleAmount });
});

router.get("/monthly", checkAccount, async function (req, res) {
  const result = await Sale.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$created" },
          year: { $year: "$created" },
        },
        grandAmount: { $sum: { $toInt: "$grandAmount" } },
      },
    },
  ]);
  console.log(result);
  res.render("report/monthly", { result: result });
});

router.get("/todaySaleItem", checkAccount, async function (req, res) {
  var now = new Date();
  const starttz = moment.utc(now).startOf("day").format();
  const endtz = moment.utc(now).endOf("day").format();
  console.log(starttz, endtz);
  const result = await Sale.aggregate([
    {
      $match: { created: { $gte: new Date(starttz), $lte: new Date(endtz) } },
    },
    { $unwind: "$list" },
    {
      $group: {
        _id: "$list.itemId",
        quantity: { $sum: "$list.qty" },
      },
    },
    {
      $addFields: {
        itemId: "$_id",
        _id: "$$REMOVE",
      },
    },
  ]);
  const info = [];
  for (var i = 0; i < result.length; i++) {
    const itemInfo = await Item.findById(result[i].itemId).select("name");
    info.push({ name: itemInfo.name, quantity: result[i].quantity });
  }
  res.render("report/todaySaleItem", { info: info });
});

module.exports = router;
