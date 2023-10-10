const express = require("express");
const router = express.Router();
const {
  register,
  login,
  searchUser,
  getUser,
  CreateClient,
  getUserByID
} = require("../controller/userController");
const { isAuthenticated } = require("../middleware/validateToken");

router.post("/register", register);
router.post("/login", login);
router.get("/getUser", getUser);
router.post("/getbyid", getUserByID);
router.post("/searchUser", isAuthenticated, searchUser);
router.post("/addclient", CreateClient);

module.exports = router;
