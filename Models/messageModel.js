const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isView: {
      type: Boolean,
      required: true,
    },
    attechment: {
      type: String,
    },
    msg_type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const messageModel = mongoose.model("Message", messageSchema);
module.exports = messageModel;
