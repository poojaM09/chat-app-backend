const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    contactNumber: {
      type: String,
      // required: true,
      minlength: 3,
      maxlength: 2000,
    },
    socketid: {
      type: String,
      required: false,
      maxlength: 2000,
    },
    password:{
      type: String,
    },
    role:{
      type: String,
    }
  },
  {
    timestamps: true,
  },

);
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
