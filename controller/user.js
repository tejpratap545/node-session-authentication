const User = require("../model/user");
const Session = require("../model/session");
const bcrypt = require("bcrypt");
const express = require("express");
const Mongoose = require("mongoose");
let redis = require("redis");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
exports.create = async (req, res, _) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user)
      return res.status(401).json({
        message:
          "The email address you have entered is already associated with another account. You can change this users role instead.",
      });

    const body = req.body;
    body.password = await bcrypt.hash(body.password, 10);
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
exports.sessionLogin = async (req, res, _) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.user = { id: user.id, email: user.email, name: user.name };

      const newSession = await Session.create({
        user: user._id,
        sessionId: req.session.id,
        lastActivate: Date.now(),
        createdAt: Date.now(),
        isActive: true,
      });
      res.redirect("/");
      res.end();
    }
  }

  res.status(401).json({
    message: "Invalid  Grant",
  });
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
exports.changePassword = async (req, res, _) => {
  const { currentPassword, newPassword, confirmNewPasssword } = req.body;
  if (newPassword === confirmNewPasssword) {
    const sessionUser = req.session.user;
    const user = await User.findById(sessionUser.id, { _id: 1, password: 1 });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (match) {
      passwordHash = await bcrypt.hash(newPassword, 10);
      // find user by id and update password

      let result = await User.findByIdAndUpdate(sessionUser.id, {
        password: passwordHash,
      });

      const userSessionFilter = {
        user: new Mongoose.Types.ObjectId(user._id),
        sessionId: {
          $not: {
            $eq: req.session.id,
          },
        },
      };
      const sessions = await Session.find(userSessionFilter, {
        sessionId: 1,
        _id: 1,
      });
      result = await Session.updateMany(userSessionFilter, {
        destroyedAt: Date.now(),
        isActive: false,
      });

      const redisSessionsKeys = sessions.map(
        (session) => `sess:${session.sessionId}`
      );

      const redisclient = redis.createClient({
        host: "localhost",
        port: 6379,
      });

      const redisResult = redisclient.del(redisSessionsKeys);

      res.redirect("/");
      res.end();
    }
  }
};
