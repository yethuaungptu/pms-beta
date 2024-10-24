var express = require("express");
var router = express.Router();
const Account = require("../models/Account");
const Item = require("../models/Item");
const Category = require("../models/Category");
const Classes = require("../models/Category");
const Supplier = require("../models/Supplier");
const Sale = require("../models/Sale");
const moment = require("moment-timezone");

var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", checkAccount, async function (req, res, next) {
  var now = new Date();
  const starttz = moment.utc(now).tz("Asia/Yangon").startOf("month").format();
  const endtz = moment.utc(now).tz("Asia/Yangon").endOf("month").format();
  const staffCount = await Account.countDocuments({
    role: "staff",
    status: true,
  });
  const stockCount = await Item.countDocuments({ status: true });
  const categoryCount = await Category.countDocuments({ status: true });
  const classCount = await Classes.countDocuments({ status: true });
  const supplierCount = await Supplier.countDocuments({ status: true });
  const totalSale = await Sale.aggregate([
    {
      $group: {
        _id: null,
        sale: {
          $sum: "$grandAmount",
        },
      },
    },
    { $unset: ["_id"] },
  ]);
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
    { $sort: { quantity: -1 } },
    { $limit: 10 },
  ]);
  const sales = [];
  for (var i = 0; i < result.length; i++) {
    const itemInfo = await Item.findById(result[i].itemId).select("name");
    sales.push({ name: itemInfo.name, quantity: result[i].quantity });
  }
  console.log(sales);
  res.render("index", {
    title: "Express",
    staffCount: staffCount,
    stockCount: stockCount,
    categoryCount: categoryCount,
    classCount: classCount,
    supplierCount: supplierCount,
    totalSale: totalSale,
    topSale: sales,
  });
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

router.get("/aboutus", function (req, res) {
  res.render("aboutus");
});

module.exports = router;
