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
  const resultInfo = await Sale.find({
    created: { $gte: starttz, $lte: endtz },
  });

  let qtyCount = 0;
  let saleAmount = 0;
  resultInfo.map((item) => {
    saleAmount += item.grandAmount;
    item.list.map((innerItem) => {
      qtyCount += innerItem.qty;
    });
  });
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
  console.log(result, qtyCount, saleAmount);
  res.render("report/daily", {
    qtyCount: qtyCount,
    saleAmount: saleAmount,
    info: info,
  });
});

router.get("/weekly", checkAccount, async function (req, res) {
  var now = new Date();
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("week").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("week").format();

  const result = await Sale.aggregate([
    {
      $match: { created: { $gte: new Date(starttz), $lte: new Date(endtz) } },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created" } },
        total: { $sum: "$grandAmount" },
      },
    },
    {
      $addFields: {
        date: "$_id",
        _id: "$$REMOVE",
      },
    },
  ]);
  console.log(result);
  res.render("report/weekly", { result: result });
});

router.get("/monthly", checkAccount, async function (req, res) {
  var now = new Date();

  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("month").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("month").format();
  console.log(starttz, endtz);
  const result = await Sale.aggregate([
    {
      $match: { created: { $gte: new Date(starttz), $lte: new Date(endtz) } },
    },
    {
      $group: {
        _id: {
          year: { $year: "$created" },
          week: { $isoWeek: "$created" },
        },
        totalGrandAmount: { $sum: "$grandAmount" },
        startOfWeek: { $min: "$created" },
        endOfWeek: { $max: "$created" },
      },
    },
    {
      $project: {
        week: {
          $concat: [
            { $toString: "$_id.year" },
            "-W",
            { $toString: "$_id.week" },
          ],
        },
        totalGrandAmount: 1,
        startOfWeek: {
          $dateFromString: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$startOfWeek" },
            },
          },
        },
        endOfWeek: {
          $dateFromString: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$endOfWeek" },
            },
          },
        },
      },
    },
    {
      $addFields: {
        startOfWeek: {
          $dateSubtract: {
            startDate: "$startOfWeek",
            unit: "day",
            amount: { $dayOfWeek: "$startOfWeek" },
          },
        },
        endOfWeek: {
          $dateAdd: { startDate: "$startOfWeek", unit: "day", amount: 6 },
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.week": 1,
      },
    },
  ]);

  console.log(result);
  res.render("report/monthly", { result: result });
});

module.exports = router;
