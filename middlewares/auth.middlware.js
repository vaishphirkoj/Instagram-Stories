const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/user.model");
const profileImageUploadPath = path.join(__dirname, "../img/profilepic");
const storyUploadPath = path.join(__dirname, "../img/story");
dotenv.config("../.env");


const authorization = (req, res, next) => {
  let token = req.headers.authorization;
  if (token === undefined) {
    res.json({ message: "Please login again Token is Expired" });
    return;
  } else {
    token = token.split("Bearer ")[1];
    jwt.verify(token, process.env.ACCSESS_TOKEN_SECRET_kEY, (err, playload) => {
      if (err) {
        return res.status(403).json({ message: "User is not authenticated." });
      } else {
        req.user = playload;
        next();
      }
    });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(profileImageUploadPath);
    cb(null, `${profileImageUploadPath}`);
  },
  filename: async (req, file, cb) => {
    let token = req.headers.authorization;
    token = token.split("Bearer ")[1];
    let decoded = jwt.decode(token);
    const getId = await User.findById({ _id: decoded.id }).select("_id");
    // console.log(getId._id);
    if (file === undefined) {
      cb(null, false);
    } else {
      let extension = path.extname(file.originalname);
      // cb(null, Date.now() + "-" + file.originalname);
      cb(null, getId._id + extension);
    }
  },
});



const uploadImg = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // console.log(file);
    if (file === undefined) {
      cb(null, false);
    } else {
      let extension = path.extname(file.originalname);
      if (
        extension !== ".png" &&
        extension !== ".jpg" &&
        extension !== ".jpeg"
      ) {
        cb(null, false);
        return cb(new Error("Only imagesare allowed"));
      }
      cb(null, true);
    }
  },
});

const storyStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let token = req.headers.authorization;
    token = token.split("Bearer ")[1];
    let decoded = jwt.decode(token);
    const getId = await User.findOne({ _id: decoded.id }).select("_id");
    console.log(getId);
    storyPath = `${storyUploadPath}/${getId._id}`;
    fs.mkdirSync(storyPath, { recursive: true });
    cb(null, storyPath);
  },
  filename: (req, file, cb) => {
    let extension = path.extname(file.originalname);
    cb(null, Date.now() + extension);
  },
});

const uploadStory = multer({
  storage: storyStorage,
  fileFilter: function (req, file, cb) {
    if (file === undefined) {
      cb(null, false);
    } else {
      let extension = path.extname(file.originalname);
      if (
        extension !== ".png" &&
        extension !== ".jpg" &&
        extension !== ".jpeg" &&
        extension !== ".mp4" &&
        extension !== ".mov" &&
        extension !== ".mkv"
      ) {
        cb(null, false);
        return cb(new Error("Only images and videos are allowed"));
      }
      cb(null, true);
    }
  },
});




module.exports = { authorization, uploadImg, uploadStory };
