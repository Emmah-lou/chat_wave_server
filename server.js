const port = 3333;
const express = require("express");
const cors = require("cors");
const app = express();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const server = require("http").createServer(app);
const dotenv = require("dotenv");
// const { default: apiKeyMiddleware } = require("./middleware/apikey");
dotenv.config();
app.use(cors());

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

const nocashe = (_, resp, next) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

const gernerateRTCToken = (req, resp) => {
  console.log("generating a token");
  resp.header("Access-Control-Allow-Origin", "*");

  let channelName = req.params.channel;
  if (!channelName)
    return resp.status(500).json({ error: "channel name is required" });

  let uid = req.params.uid;
  if (!uid || uid == "")
    return resp.status(500).json({ error: "uid is required" });

  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(500).json({ error: "role is incorrect" });
  }

  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  let token;
  if (req.params.tokentype === "userAccount") {
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else if (req.params.tokentype === "uid") {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else {
    return resp.status(500).json({ error: "token type is invalid" });
  }

  return resp.json({ rtcToken: token });
};

// app.use(apiKeyMiddleware);

app.get("/rtc/:channel/:role/:tokentype/:uid", nocashe, gernerateRTCToken);

server.listen(port, () => {
  console.log("in the server.js file");
});
