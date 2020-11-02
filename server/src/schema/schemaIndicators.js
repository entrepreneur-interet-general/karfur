const mongoose = require("mongoose");

var indicatorSchema = mongoose.Schema(
  {
    language: {
      type: String,
      required: true
    },
    wordsCount: {
      type: Number,
    },
    dispositifId: {
      type: mongoose.Schema.ObjectId,
      ref: "Dispositif",
      required: true
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    timeSpent: {
      type: Number,
    },
  },
  { timestamps: { createdAt: "createdAt" } }
);

module.exports = mongoose.model("Indicator", indicatorSchema);
