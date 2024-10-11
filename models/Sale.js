const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleSchema = new Schema({
  slipNo: {
    type: Number,
    required: true,
  },
  dateStr: {
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
    default: Date.now(),
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Sales", SaleSchema);
