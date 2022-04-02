const mongoose = require("mongoose");
require("../db/conn");
const { ObjectId } = mongoose.Schema.Types;

const storySchema = mongoose.Schema({
  //   story: { type: String },
  story: { data: Buffer, contentType: String },
  user: { type: ObjectId, ref: "User" },
  views: [{ type: ObjectId, ref: "User" }],
});

const Story = mongoose.model("Story", storySchema);
module.exports = Story;
