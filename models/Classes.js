const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClassesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
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

module.exports = mongoose.model("Classes", ClassesSchema);
