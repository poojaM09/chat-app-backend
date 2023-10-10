const express = require("express");
const router = express.Router();
const { sendMessage, sendImage, getAllMessage, viewMessage, changeStatus,getAllUserMessage ,getByIDMessage,DeleteUserMessage,UpdateUserMessage} = require("../controller/messageController");
const { chatApi, imagGenrator } = require("../controller/chatGptController");
const { isAuthenticated } = require("../middleware/validateToken");
const { imageUpload } = require("../middleware/multer");
router.post("/sendMessage", sendMessage);
router.post("/sendImage", imageUpload, sendImage);
router.post("/getAllMessage", isAuthenticated, getAllMessage);
router.post("/isViewMessage", isAuthenticated, viewMessage);
router.post("/changeStatus", isAuthenticated, changeStatus);
router.post("/getByIDMessage", getByIDMessage);
router.delete("/DeleteUserMessage", DeleteUserMessage);
router.delete("/UpdateUserMessage", UpdateUserMessage);
router.post("/userMessage",getAllUserMessage);
router.post("/chatapi", chatApi);
router.post("/imagGenrator", imagGenrator);

// router.post("/chatapi", async (req, res) => {
//   const msg = req.body.message;
//   const response = await chatApi(req, res);
//   console.log("response response", response);
//   return res.json({
//     message: response,
//   });
// });

module.exports = router;
