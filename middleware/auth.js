const express = require("express");
const Session = require("../model/session");
/**
 *
 * delete record from mongodb
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.auth = async (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.status(401).send({ message: "Unauthorized" });
  const session = await Session.findOne({ sessionId: req.session.id }).populate(
    "user"
  );
  if (!session) return res.status(401).send({ message: "Session expired" });
  if (!session.user._id == user.id)
    return res.status(401).send({ message: "Unauthorized" });

  if (!session.isActive)
    return res.status(401).send({ message: "Session expired" });

  req.user = session.user;
  next();
};
