const express = require("express");
const router = express.Router();
const storyController = require("../controllers/story.controller");
const authorization = require("../middlewares/auth.middlware");

router.post(
  "/storyAdd",
  authorization.authorization,
  authorization.uploadStory.single("story"),
  storyController.addStory
);

router.get(
  "/storiesGet",
  authorization.authorization,
  storyController.getStory
);

router.post(
  "/storyView",
  authorization.authorization,
  storyController.viewStory
);

router.post(
  "/storyDelete",
  authorization.authorization,
  storyController.deleteStory
);



module.exports = router;
