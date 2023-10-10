const multer = require("multer");

const storage = multer.diskStorage({
  destination: "public",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// const imageUpload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype === "image/png"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       return cb(new Error("Only .png allowed"));
//     }
//   },
// }).single("image");

const imageUpload = (req, res, next) => {
  multer({
    storage: storage,
  }).single("image")(req, res, (error) => {
    if (error) {
      // Handle the error
      res.status(400).json({ status: "400", error: error.message });
    } else {
      next();
    }
  });
};

module.exports = { imageUpload };
