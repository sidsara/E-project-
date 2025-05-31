const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads-img/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage });
