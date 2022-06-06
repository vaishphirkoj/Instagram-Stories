const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Story = require("../models/story.model");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const savedStoryPath = path.join(__dirname, "../img/story");
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

const getStory = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);

    const userStory = await Story.find({ user: tokenId });
    console.log(userStory);

    const followingList = await User.findById({ _id: tokenId }).select("-_id");
    console.log(`${followingList.username} || ${followingList.following}`);

    const stories = await Story.find({
      user: { $in: followingList.following },
    });
    console.log(stories);

    res.json(
      { stories: stories },
      { userStory: userStory.story },
      { userStoryId: userStory.user },
      { userStoryId: userStory.views }
      // { followingList: followingList.following },
    );
  } catch (err) {
    console.log(err);
  }
};

const addStory = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    // console.log(`decoded: ${decoded.id}`);   
    let storyName, storyContent;
    if (req.file === undefined) {
      return res.json({ message: "Something went wrong." });
    } else {
      storyName = req.file.filename;
      storyContent = req.file.mimetype;
    }
    const obj = {
      story: { data: storyName, contentType: storyContent },
      user: tokenId,
    };
    try {
      const storyData = new Story(obj);
      const response = await storyData.save();
      console.log(`response ${response}`);
      // res.send("upload")
      res.status(200).json({ message: "story Uploaded", response: response });
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(err);
  }
};

const deleteStory = async (req, res) => {
  try {
    let storyId = req.body.storyId;
    checkStory = await Story.findById({ _id: storyId });
    if (checkStory) {
      console.log(`This is curent Story ${checkStory}`);
      // delete file named 'sample.txt'
      fileName = checkStory.story.data.toString();
      fs.unlink(`${savedStoryPath}/${checkStory.user}/${fileName}`, (err) => {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log(
          `${savedStoryPath}/${checkStory.user}/${fileName} File deleted!`
        );
      });
      deleteRecord = await Story.deleteOne({ _id: storyId });
      console.log(`file is deleted. `);
      res.status(401).json({
        message: "Deleted Story..",
        recordDelete: deleteRecord,
        story: checkStory,
      });
    } else {
      res.json({ message: "Story not found." });
    }
  } catch (error) {
    console.log(error);
  }
};

const viewStory = async (req, res) => {
  try {
    let tokenId = getToken(req.headers.authorization);
    console.log(tokenId);
    const { storyId } = req.body;
    const viewsList = await Story.find({ _id: storyId });
    console.log({ listing: viewsList.user });

    // let list = viewsList.views;
    // const checkTokenId = list.find((elm) => elm == tokenId);
    // console.log(`this is find element from array ${checkTokenId}`)
    
      // let list = viewsList.views;
    // const checkTokenId = list.find((elm) => elm == tokenId);
    // console.log(`this is find element from array ${checkTokenId}`);

    // let updateViews = await Story.findOneAndUpdate(
    //   { _id: storyId },
    //   { $push: { views: tokenId } }
    // );
    // console.log(`${updateViews}`);

  } catch (error) {
    console.log(error);
    return;

  }
};











// const viewStory = async (req, res) => {
//   try {
//     let tokenId = getToken(req.headers.authorization);
//     console.log(tokenId);
//     const { storyId } = req.body;
//     const viewsList = await Story.find({ _id: storyId });
//     console.log({ listing: viewsList.user })





module.exports = { getStory, addStory, deleteStory, viewStory };


