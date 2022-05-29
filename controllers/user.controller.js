const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config("../.env");

const getToken = (headerToken) => {
  try {
    let token = headerToken;
    token = token.split("Bearer ")[1];
    let decoded = jwt.decode(token);
    return decoded.id;
  } catch (err) {
    console.log(err);
  }
};

const getUser = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const getUserDetail = await User.findById({ _id: tokenId }).select(
      "-password"
    );
    res.json({ userDetail: getUserDetail });
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);

    const getProfileImg = await User.findById({ _id: tokenId }).select(
      "profilepic"
    );
    // console.log(      `this is converted to string ${getProfileImg.profilepic.data.toString()}`    );

    let imgData = getProfileImg.profilepic.data;
    let imgContent = getProfileImg.profilepic.contentType;

    if (req.file === undefined) {
      console.log("if undefined file");
      imgData;
      imgContent;
    } else {
      console.log("if file is available");
      imgData = req.file.filename;
      imgContent = req.file.mimetype;
    }

    // console.log(`${imgData} -- ${imgContent}`);



    const { username, email, password, fullname, bio, followers, following } =
      req.body;
    const obj = {
      username,
      password,
      fullname,
      email,
      bio,
      profilepic: { data: imgData, contentType: imgContent },
      followers,
      following,
    };
    console.log(obj);
    try {
      const updateUserDetail = await User.updateOne({ _id: tokenId }, obj);
      console.log(updateUserDetail);
      res.status(201).json({
        message: "User Updated Successfully. ✔✌",
      });
    } catch (error) {
      console.log(error);
      res.json({
        message: error,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const addUser = async (req, res) => {
  console.log(req.body);
  try {
    const checkUser = await User.findOne({ username: req.body.username });
    if (checkUser) {
      res.json({ message: "username is already taken" });
    } else {
      const data = new User(req.body);
      const response = await data.save();
      res.json({
        message: "Registration Done",
        _id: response._id,
        userName: response.username,
        fullName: response.fullname,
        email: response.email,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ username: req.body.username });
    console.log(checkUser);
    if (checkUser) {
      let matchPassword = await bcrypt.compare(
        req.body.password,
        checkUser.password
      );
      if (matchPassword) {
        let Token = jwt.sign(
          {
            username: checkUser.username,
            id: checkUser._id,
            email: checkUser.email,
          },
          process.env.ACCSESS_TOKEN_SECRET_kEY,
          {
            expiresIn: "1800s", // 900s - 15 Min || 1800s - 30 Min
          }
        );
        return res.status(201).json({
          message: "Login Successful",
          userToken: Token,
          User: checkUser.username,
        });
      } else {
        return res.json({ message: "Invalid Password" });
      }
    } else {
      res.json({ message: "User is not Registered" });
    }
  } catch (err) {
    console.log(err);
  }
};

const follow = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { profileId } = req.body;
    try {
      const checkFollowId = await User.findById({ _id: tokenId }).select(
        "following"
      );
      console.log(checkFollowId.following);
      let followingList = checkFollowId.following;
      const checkProfileId = followingList.find((elm) => elm == profileId);
      console.log(`this is find element from array ${checkProfileId}`);

      if (checkProfileId) {
        // console.log(`this is in if Condition ${checkProfileId}||${profileId}`);

        console.log(`you are already following this user`);
        res.json({
          message: `you are already following this user ${profileId}`,
        });
      } else {
        let updateFollowing = await User.findOneAndUpdate(
          { _id: tokenId },
          { $push: { following: profileId } }
        );

        let updateFollowers = await User.findOneAndUpdate(
          { _id: profileId },
          { $push: { followers: tokenId } }
        );

        res.json({
          message: `following to ${profileId}`,
          following: updateFollowing._id,
          followers: updateFollowers._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const unfollow = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    const { profileId } = req.body;
    const checkFollowId = await User.findById({ _id: tokenId }).select(
      "following"
    );
    let followingList = checkFollowId.following;
    console.log(followingList);
    const checkProfileId = followingList.find((elm) => elm == profileId);
    // console.log(`this is find element from array ${checkProfileId}`);
    if (checkProfileId) {
      let updateUnfollwing = await User.findOneAndUpdate(
        { _id: tokenId },
        { $pull: { following: profileId } }
      );
      res.json({
        message: `Unfollow to ${profileId}`,
        following: updateUnfollwing,
      });
    } else {
      res.json({
        message: `You are not following to ${profileId} user, So you can't click on unfollow.`,
        // following: updateUnfollwi
      });
    }
  } catch (error) {
    console.log(error);
  }
};














module.exports = { getUser, addUser, loginUser, updateUser, follow, unfollow };
