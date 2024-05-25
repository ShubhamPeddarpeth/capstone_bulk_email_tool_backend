const mongoose = require("mongoose");

const sentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    fromEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const Sent = mongoose.model("Sent", sentSchema);

module.exports = Sent;
