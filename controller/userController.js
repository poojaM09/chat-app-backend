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
  const user = new userModel({
    name: name.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    socketid: '',
    role: "1"
  });
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
      role:existUser.role,
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
      message: "all fields are required.",
    });
  }
  const searchTerms = search.split(" ");
  try {
    const data = await userModel.find({
      $or: [
        {
          $or: searchTerms.map(term => ({
            name: { $regex: term, $options: 'i' },
          })),
        },
        {
          $or: searchTerms.map(term => ({
            email: { $regex: term, $options: 'i' },
          })),
        },
      ],
    });
    if (data.length > 0) {
      return res.json({
        status: 1,
        user: data,
        message: "Search successful.",
      });
    } else {
      return res.json({
        status: 0,
        message: "No results found.",
      });
    }
  } catch (error) {
    console.log(error);
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

  const emailLowerCase = email.toLowerCase();

  const existingUser = await userModel.findOne({ email: emailLowerCase });

  if (existingUser) {
    existingUser.name = name.toLowerCase();
    existingUser.contactNumber = contactNumber;
    existingUser.email = emailLowerCase;
    const newToken = jwt.sign({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      contactNumber: existingUser.contactNumber,
      role:existingUser.role
    }, process.env.JWT_KEY, { expiresIn: "7d" });
    existingUser.token = newToken;
    await existingUser.save();

    return res.json({
      status: 1,
      message: "User data updated, JWT token refreshed",
      token: newToken,
      user: existingUser
    });
  } else {
    const user = new userModel({
      name: name.toLowerCase(),
      email: emailLowerCase,
      contactNumber: contactNumber,
      socketid: '',
      role: "0"
    });
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      contactNumber: user.contactNumber
    }, process.env.JWT_KEY, { expiresIn: "7d" });
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
      service: 'Gmail',
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



module.exports = { register, login, getUser, searchUser, CreateClient, getUserByID, SendMail };
