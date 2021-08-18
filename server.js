const express = require("express");
const session = require("express-session");
const redis = require("redis");
const mongoose = require("mongoose");
const userController = require("./controller/user");
const app = express();
const User = require("./model/user");

const expressLayouts = require("express-ejs-layouts");

app.use(express.json());
app.use(express.urlencoded());

const { body, validationResult } = require("express-validator");
const { log } = require("npmlog");
const Session = require("./model/session");

// redis session store
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

redisClient.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
redisClient.on("connect", function (err) {
  console.log("Connected to redis successfully");
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECERT || "sessionSecert",
    resave: false,
    saveUninitialized: false,
  })
);

// set the view engine to ejs
app.set("view engine", "ejs");

app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));
// define routes
app.post(
  "/api/user/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  userController.create
);

app.post(
  "/login",

  userController.sessionLogin
);
app.get("/change-password", async (req, res, _) => {
  res.render("changePassword");
});
app.post("/change-password", userController.changePassword);

app.get("/", async (req, res, _) => {
  const user = req.session.user;
  if (!user) return res.redirect("/login");

  res.json(user);
});

app.get("/login", async (req, res, _) => {
  res.render("login");
});

app.get("/sessions", async (req, res, _) => {
  const user = req.session.user;
  const sesssions = await Session.find(
    {
      user: new mongoose.Types.ObjectId(user.id),
    },
    {},
    {
      sort: { isActive: -1, lastActivate: -1, createdAt: -1 },
    }
  );
  const currentSession = sesssions.find(
    (session) => session.sessionId === req.session.id
  );
  res.render("sessions", {
    sesssions: sesssions,
    currentSession: currentSession,
  });
});
app.post("/logout", async (req, res, _) => {
  Session.findOneAndUpdate(
    { sessionId: req.session.id },
    { destroyedAt: Date.now(), isActive: false }
  );
  req.session.destroy();
});
const run = async () => {
  const mongooseConnection = await mongoose.connect(
    process.env.MONGO_URL || "mongodb://localhost:27017/node-auth"
  );

  const port = process.env.PORT || 8080;
  app.listen(port, () =>
    console.log(`Node js Backend listening on http://localhost:${port} !`)
  );
};

run();
