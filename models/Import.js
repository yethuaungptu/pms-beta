const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImportSchema = new Schema({
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: "Suppliers",
  },
  arrivalDate: {
    type: Date,
    default: Date.now(),
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  list: [
    {
      itemId: {
        type: Schema.Types.ObjectId,
        ref: "Items",
      },
      quantity: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],

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

module.exports = mongoose.model("Imports", ImportSchema);
