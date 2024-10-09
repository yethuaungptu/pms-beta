var express = require("express");
const bcrypt = require("bcryptjs");
var router = express.Router();
const Account = require("../models/Account");
const Supplier = require("../models/Supplier");

/* GET users listing. */
var checkAccount = function (req, res, next) {
  if (req.session.account) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/staffsetup", checkAccount, async function (req, res, next) {
  const accounts = await Account.find({ role: "staff", status: true });
  res.render("contact/staffsetup", { accounts: accounts });
});

router.post("/staffsetup", checkAccount, async function (req, res) {
  const account = new Account();
  account.name = req.body.name;
  account.email = req.body.email;
  account.password = req.body.password;
  account.position = req.body.position;
  account.phone = req.body.phone;
  account.role = "staff";
  const data = await account.save();
  res.redirect("/contact/staffsetup");
});

router.post("/staffupdate", checkAccount, async function (req, res) {
  const update = {
    name: req.body.uname,
    email: req.body.uemail,
    phone: req.body.uphone,
    position: req.body.uposition,
  };
  if (req.body.upassword != "")
    update.password = bcrypt.hashSync(
      req.body.upassword,
      bcrypt.genSaltSync(8),
      null
    );
  const data = await Account.findByIdAndUpdate(req.body.id, update);
  res.redirect("/contact/staffsetup");
});

router.post("/staffdup", checkAccount, async function (req, res) {
  const staff = await Account.findOne({ email: req.body.email });
  if (staff == null) res.json({ status: false });
  else res.json({ status: true });
});

router.get("/deletestaff/:id", checkAccount, async function (req, res) {
  const update = {
    status: false,
  };
  const data = await Account.findByIdAndUpdate(req.params.id, update);
  res.redirect("/contact/staffsetup");
});

router.get("/suppliersetup", checkAccount, async function (req, res) {
  const suppliers = await Supplier.find({ status: true });
  res.render("contact/suppliersetup", { suppliers: suppliers });
});

router.post("/suppliersetup", checkAccount, async function (req, res) {
  const supplier = new Supplier();
  supplier.supplierName = req.body.Sname;
  supplier.email = req.body.email;
  supplier.phone = req.body.phone;
  supplier.companyName = req.body.Cname;
  supplier.address = req.body.address;
  const data = await supplier.save();
  res.redirect("/contact/suppliersetup");
});

router.post("/supplierupdate", checkAccount, async function (req, res) {
  const update = {
    supplierName: req.body.uSname,
    email: req.body.uemail,
    phone: req.body.uphone,
    companyName: req.body.uCname,
    address: req.body.uaddress,
    updated: Date.now(),
  };
  const data = await Supplier.findByIdAndUpdate(req.body.id, update);
  res.redirect("/contact/suppliersetup");
});

router.get("/supplierdelete/:id", checkAccount, async function (req, res) {
  const data = await Supplier.findByIdAndUpdate(req.params.id, {
    status: false,
  });
  res.redirect("/contact/suppliersetup");
});
module.exports = router;
