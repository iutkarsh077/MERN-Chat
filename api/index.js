import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import UserModel from "./models/User.js";
import cors from "cors";
import bcryptjs from "bcryptjs";
import WebSocket, { WebSocketServer } from "ws";
import MessageModel from "./models/Messages.js";

const app = express();
const port = process.env.PORT || 8000;
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_ADDRESS || 'https://mern-chat-frontend-seven.vercel.app/',
  })
);
app.use(express.json());
const jwtsecret = process.env.JWT_SECRET;
app.use(cookieParser());
const salt = bcryptjs.genSaltSync(10);

(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
      console.log("Database Connected successfully", mongoose.connection.host);
    });
  } catch (error) {
    console.log("Error occured in database", error);
  }
})();
async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtsecret, {}, (err, userdata) => {
        if (err) throw err;
        resolve(userdata);
      });
    }
    else{
      reject('no token')
    }
  });
}
app.get("/", (req, res) => {
  return res.status(200).json({ msg: "ok" });
});

app.get("/user/messages/:userId",async (req, res) => {
  const {userId} = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await MessageModel.find({
    sender:{$in:[userId, ourUserId]},
    recipient:{$in:[userId,ourUserId]}
  }).sort({createdAt: 1});
  return res.json(messages);
});

app.get("/user/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtsecret, (err, userdata) => {
      if (err) throw err;
      return res.json(userdata);
    });
  } else {
    return res.status(420).json("no token");
  }
});

app.post("/user/Login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await UserModel.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ msg: "User is not available!" });
    }

    const checkingPassword = bcryptjs.compare(password, foundUser.password);
    if (!checkingPassword) {
      return res.status(401).json({ msg: "Incorrect Password!" });
    }

    jwt.sign({ userId: foundUser._id, username }, jwtsecret, (err, token) => {
      if (err) throw err;
      return res
        .cookie("token", token)
        .status(201)
        .json({ msg: "ok", id: foundUser._id });
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong" });
  }
});

app.post("/user/register", async (req, res) => {
  const { username, password } = req.body;
  if (username == "" || password == "") {
    return res
      .status(204)
      .json({ msg: "please provide required information!" });
  }

  const findingUser = await UserModel.findOne({ username });
  console.log(findingUser);

  if (findingUser) {
    return res.status(401).json({ msg: "User is already available!" });
  }

  const hashedPassword = bcryptjs.hashSync(password, salt);

  const createdUser = await UserModel.create({
    username,
    password: hashedPassword,
  });

  try {
    jwt.sign({ userId: createdUser._id, username }, jwtsecret, (err, token) => {
      if (err) throw err;
      return res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({ msg: "ok", id: createdUser._id });
    });
  } catch (error) {
    return res.status(401).json({ msg: error });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const tokenCookieString = cookie
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      //   console.log(tokenCookieString);
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
          if (err) throw err;
          // console.log(userData);
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const msgData = JSON.parse(message.toString());
    // console.log(msgData);
    const { recipient, text } = msgData;
    // console.log(text);
    if (recipient && text) {
      const messageDoc = await MessageModel.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
