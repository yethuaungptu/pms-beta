const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
var moment = require("moment-timezone");

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

module.exports = router;
