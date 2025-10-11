const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["general", "bug"],
    required: true,
  },
  category: {
    type: String,
    enum: ["address", "delivery", "affiliate", "payment", "product", "return", "feature", "other", null],
    default: null,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
