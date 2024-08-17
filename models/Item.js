const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: "Classes",
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Categories",
  },
  price: {
    type: Number,
    required: true,
  },
  expDate: {
    type: Date,
    required: true,
  },
  isUnit: {
    type: Boolean,
    required: true,
  },
  unit: [
    {
      uname: String,
      uquantity: Number,
      uprice: Number,
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "Accounts",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Accounts",
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Items", ItemSchema);
