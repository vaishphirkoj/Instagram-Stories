const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
require("./db/conn.js");
dotenv.config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", require("./routes/user.route"));

app.use("/story", require("./routes/story.route"));

app.get("/", (req, res) => {
  res.send("Namsthe World!");
});

app.listen(PORT, () => {
  console.log(`Server in running on ${PORT}`);
});
