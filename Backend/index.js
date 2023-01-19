const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const connection = require("./Config/db");
const UserModel = require("./Models/UserModel");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to Bug Tracker");
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const email_exists = await UserModel.findOne({ email });

  if (email_exists?.email) {
    res.send("Email already exist");
  } else {
    try {
      bcrypt.hash(password, 11, async (err, hashpass) => {
        const users = new UserModel({ email, password: hashpass });
        await users.save();
        res.send("Signup Successfully");
      });
    } catch (error) {
      console.log(error);
      console.log("Somthing error in SingUp function");
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.find({ email });
    if (user.length > 0) {
      const hashed_password = user[0].password;
      bcrypt.compare(password, hashed_password, function (err, result) {
        if (result) {
          const token = jwt.sign({ userID: user[0]._id }, "hush");
          res.send({ msg: "Login Successful", token: token });
        } else {
          res.send("Invalid Credentials");
        }
      });
    }
  } catch (error) {
    console.log("somthing Wrong in Login");
    console.log(error);
  }
});

app.listen("8080", async () => {
  try {
    await connection;
    console.log("Successful Connected ");
  } catch (error) {
    console.log("Somthing Error in DB Connection");
    console.log(error);
  }
  console.log("Listening On Port 8080");
});
