const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  if (!validator.isEmail(email)) {
    return res.json({
      status: 0,
      message: "invalid email",
    });
  }
  const existUser = await userModel.findOne({ email });
  if (existUser) {
    return res.json({
      status: 0,
      message: "user Already exist...",
    });
  }
  if (!validator.isStrongPassword(password)) {
    return res.json({
      status: 0,
      message: "storng password required",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new userModel({ name, email, password: hashedPassword, socketid: '' });
  await user.save();

  res.json({
    status: 1,
    message: "Done",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  const existUser = await userModel.findOne({ email });
  if (!existUser) {
    return res.json({
      status: 0,
      message: "user does not exist with this email",
    });
  }
  bcrypt.compare(password, existUser.password, (err, result) => {
    if (err) {
      return res.json({
        status: 0,
        message: "Something Wrong occured",
      });
    }
    if (!result) {
      return res.json({
        status: 0,
        message: "Invalid Password ! ",
      });
    }
    const payload = {
      id: existUser._id,
      name: existUser.name,
      email: existUser.email,
      password: existUser.password,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "7d" });

    return res.json({
      status: 1,
      message: "login sucessfully",
      token: token,
      user: payload,
    });
  });
};

const getUser = async (req, res) => {
  const users = await userModel.find();
  return res.json({
    status: 1,
    users: users,
  });
};

const searchUser = async (req, res) => {
  const { search } = req.body;
  if (!search) {
    return res.json({
      status: 0,
      message: "all fildes are required.",
    });
  }
  try {
    const data = await userModel.find({
      $or: [
        {
          name: { $regex: `^${search}`, $options: 'm' },
        },
        { email: { $regex: `^${search}`, $options: 'm' } },
      ],
    });
    if (data.length > 0) {
      return res.json({
        status: 1,
        user: data,
        message: "search successfully.",
      });
    } else {
      return res.json({
        status: 0,
        message: "No result Found ",
      });
    }
  } catch (error) {
    console.log("error");
  }
};

const CreateClient = async (req, res) => {
  const { name, email, contactNumber } = req.body;

  if (!name || !email || !contactNumber) {
    return res.json({
      status: 0,
      message: "All fields are required.",
    });
  }
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    existingUser.name = name;
    existingUser.contactNumber = contactNumber;
    existingUser.email = email;
    const newToken = jwt.sign({ id:existingUser.id,email: existingUser.email ,name:existingUser.name,contactNumber:existingUser.contactNumber}, process.env.JWT_KEY, { expiresIn: "7d" });
    existingUser.token = newToken;
    await existingUser.save();

    return res.json({
      status: 1,
      message: "User data updated, JWT token refreshed",
      token: newToken,
      data: existingUser
    });
  } else {
    const user = new userModel({ name, email, contactNumber, socketid: '' });
    const token = jwt.sign({id,email,name, email, contactNumber }, process.env.JWT_KEY, { expiresIn: "7d" })
    user.token = token;

    await user.save();

    return res.json({
      status: 1,
      message: "User created",
      token,
      user,
    });
  }
};

const getUserByID = async (req, res) => {
  const id = req.body.id
  const users = await userModel.find({ _id: id });
  return res.json({
    status: 1,
    users: users,
  });
};

const SendMail = async (req, res) => {
  try {
    const { name, email, contact, message } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // You can use other email services or SMTP details here
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
      },
    });
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'recipient_email@example.com',
      subject: 'Message from Your Website', 
      text: `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Email sending failed' });
  }
};



module.exports = { register, login, getUser, searchUser, CreateClient, getUserByID ,SendMail};
