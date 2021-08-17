const User = require("../model/user");
const Session = require("../model/session");
const bcrypt = require("bcrypt");
const express = require("express");

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
  if (user)
    return res.status(401).json({
      message: "Invalid  Grant",
    });

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    req.session.regenerate();
    req.session.user = { id: user.id, email: user.email, name: user.name };

    const session = await Session.create({
      sessionId: req.session.id,
      lastActivate: Date.now(),
      createdAt: Date.now(),
      isActive: true,
    });
    return res.redirect("/home");
  }
  return res.status(401).json({
    message: "Invalid  Grant",
  });
};
