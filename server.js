const express = require("express");
const session = require("express-session");
const redis = require("redis");
const mongoose = require("mongoose");
const app = express();

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

app.get();
const run = async () => {
  const mongooseConnection = await mongoose.connect(process.env.MONGO_URL);

  const port = process.env.PORT || 8080;
  app.listen(port, () =>
    console.log(`Node js Backend listening on http://localhost:${port} !`)
  );
};

run();
