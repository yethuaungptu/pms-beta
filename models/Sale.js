const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var moment = require("moment-timezone");

const SaleSchema = new Schema({
  slipNo: {
    type: Number,
    required: true,
  },
  dateStr: {
    type: String,
    required: true,
  },
  paidBy: {
    type: String,
    required: true,
  },
  cashierId: {
    type: Schema.Types.ObjectId,
    ref: "Accounts",
  },
  tax: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  grandAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    required: true,
  },
  refundAmount: {
    type: Number,
    required: true,
  },
  list: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        ref: "Items",
      },
      qty: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  created: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
  updated: {
    type: Date,
    default: moment.utc(Date.now()).tz("Asia/Yangon").format(),
  },
});

module.exports = mongoose.model("Sales", SaleSchema);
