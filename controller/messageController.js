const messageModel = require("../Models/messageModel");

const sendMessage = async (req, res) => {
  const { from, to, message, msg_type } = req.body;
  if (!from || !to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }

  try {
    const data = await messageModel.create({
      text: message ? message : "",
      to: to,
      from: from,
      msg_type: msg_type,
      isView: false,
    });
    if (data) {
      return res.json({
        status: 1,
        message: "message send successfully..",
      });
    } else {
      return res.json({
        status: 1,
        message: "can not send message",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const sendImage = async (req, res) => {
  const { from, to, msg_type } = req.body;
  if (!req.file) {
    console.log("file require");
  }
  const file = req.file.filename;

  if (!from || !to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }

  try {
    const data = await messageModel.create({
      attechment: file,
      to: to,
      from: from,
      isView: false,
      msg_type: msg_type,
    });
    if (data) {
      return res.json({
        data: data.attechment,
        status: 1,
        message: "image send successfully..",
      });
    } else {
      return res.json({
        status: 1,
        message: "can not send message",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const getAllMessage = async (req, res) => {
  try {
    const { from, to } = req.body;
    const data = await messageModel.find({
      $or: [
        { $and: [{ to: to, from: from }] },
        { $and: [{ to: from, from: to }] },
      ],
    });
    console.log(data, 'data')
    const projectMsg = data.map((msg) => {
      console.log(msg, 'msg')
      return {
        fromSelf: msg.from.toString() === from,
        message: msg.text,
        msg_type: msg.msg_type,
        attechment: msg.attechment,
        createdAt: msg.createdAt,
        attechment: msg.attechment,
        from: msg.from,
        to: msg.to
      };
    });
    return res.json({
      status: 1,
      message: projectMsg,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const viewMessage = async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.find({
      $and: [{ to: to, isView: false }],
    });
    return res.json({
      status: 1,
      message: data,
    });
  } catch (err) {
    console.log("error", err);
  }
};

const changeStatus = async (req, res) => {
  const { to, from } = req.body;
  if (!to || !from) {
    return res.json({
      status: 0,
      message: "all fields are require",
    });
  }
  try {
    const data = await messageModel.updateMany(
      {
        $and: [{ to: to }, { from: from }],
      },
      {
        $set: { isView: true },
      }
    );
    return res.json({
      status: 1,
      message: "updated sucussfully",
    });
  } catch (err) {
    console.log("error", err);
  }
};

const getAllUserMessage = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await messageModel.find({
      $or: [
        { $and: [{ to: id }] },
        { $and: [{ from: id }] },
      ],
    });
    const projectMsg = data.map((msg) => {
      return {
        fromSelf: msg.from.toString() === id,
        message: msg.text,
        msg_type: msg.msg_type,
        attechment: msg.attechment,
        createdAt: msg.createdAt,
        attechment: msg.attechment,
        from: msg.from,
        to: msg.to
      };
    });
    return res.json({
      status: 1,
      message: projectMsg,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const getByIDMessage = async (req, res) => {
  try {
    const { id, msg } = req.body; // Changed variable name from Msg to msg to match user input
    const data = await messageModel.find({
      $or: [
        {
          $and: [{ to: id }, { text: { $regex: msg, $options: 'i' } }]
        },
        {
          $and: [{ from: id }, { text: { $regex: msg, $options: 'i' } }]
        }
      ]
    });

    const projectMsg = data.map((msg) => ({
      fromSelf: msg.from.toString() === id,
      message: msg.text,
      msg_type: msg.msg_type,
      attachment: msg.attachment,
      createdAt: msg.createdAt,
      from: msg.from,
      to: msg.to,
    }));

    return res.json({
      status: 1,
      message: projectMsg,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    return res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
};

const DeleteUserMessage = async (req, res) => {
  try {
    const { id, Msg } = req.body;

    // Find messages based on the criteria
    const data = await messageModel.find({ msg: Msg, from: id });
    const messageIdsToDelete = data.map((msg) => msg._id);
    await messageModel.deleteMany({ _id: { $in: messageIdsToDelete } });

    return res.json({
      status: 1,
      message: "Messages deleted successfully",
    });
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
};

const UpdateUserMessage = async (req, res) => {
  try {
    const { id, Msg, updatedMsg } = req.body;

    // Update messages based on the criteria
    const result = await messageModel.updateMany(
      { msg: Msg, from: id },
      { $set: { text: updatedMsg } }
    );

    if (result.nModified > 0) {
      return res.json({
        status: 1,
        message: "Messages updated successfully",
      });
    } else {
      return res.json({
        status: 0,
        message: "No messages were updated",
      });
    }
  } catch (error) {
    console.error("error", error);
    return res.status(500).json({
      status: 0,
      message: "Internal server error",
    });
  }
};


module.exports = {
  sendMessage,
  getAllMessage,
  viewMessage,
  changeStatus,
  sendImage,
  getAllUserMessage,
  getByIDMessage,
  DeleteUserMessage,
  UpdateUserMessage
};
