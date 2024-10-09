const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StockAdjSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Items",
  },
  originalQty: {
    type: Number,
    required: true,
  },
  reduceQty: {
    type: Number,
    required: true,
  },
  remark: {
    type: String,
    required: true,
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

module.exports = mongoose.model("StockAdjs", StockAdjSchema);
