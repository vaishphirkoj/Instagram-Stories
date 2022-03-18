const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authorization = require("../middlewares/auth.middlware");

router.post(
  "/userUnfollow",
  authorization.authorization,
  userController.unfollow
);


router.post("/userFollow", authorization.authorization, userController.follow);

router.get("/userDetail", authorization.authorization, userController.getUser);

router.post(
  "/userDetailUpdate",
  authorization.authorization,
  authorization.uploadImg.single("profilepic"),
  userController.updateUser
);

router.post("/userAdd", userController.addUser);

router.post("/userLogin", userController.loginUser);

module.exports = router;
