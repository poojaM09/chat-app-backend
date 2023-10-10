const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
      if (err) return err;
      if (!data) {
        console.log("You are Not verifed");
        return res.json({
          status: 0,
          message: "You are Not verifed",
        });
      } else {
        const user = await userModel.findOne({ email: data.email });
        if (!user) {
          res.json({
            status: 0,
            message: "user not available",
          });
        } else {
          // res.json({
          //   status: 1,
          //   message: "you are verifyed",
          // });
          next();
        }
      }
    });
  } else {
    return res.json({
      status: 0,
      message: "Token require",
    });
  }
};

module.exports = { isAuthenticated };
