const mongoose = require("mongoose");

var errorSchema = mongoose.Schema(
  {
    name: {type: String},
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    dataObject: {
      type: Object,
    },
    error: {
      type: Object, 
    }
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Error", errorSchema);
