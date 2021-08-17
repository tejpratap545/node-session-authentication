const express = require("express");
const session = require("express-session");
const redis = require("redis");
const mongoose = require("mongoose");
const userController = require("./controller/user");
const app = express();
app.use(express.json());

const { body, validationResult } = require("express-validator");

// redis session store
let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient();
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECERT || "sessionSecert",
    resave: false,
    saveUninitialized: true,
  })
);

// define routes
app.post(
  "/api/user/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  userController.create
);

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
