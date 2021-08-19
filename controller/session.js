const Session = require("../model/session");
const express = require("express");
let redis = require("redis");
const redisclient = redis.createClient({
  host: "localhost",
  port: 6379,
});

exports.getSession = (req, res) => {
  res.json(req.session);
};

/**

 *  destroy session
 *    - delete from redis
 *    - update session in mongodb
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} _
 */
exports.destroy = async (req, res, _) => {
  const id = req.params.id;
  try {
    const session = await Session.findById(id);
    if (!session)
      return res.status(400).json({ message: "Session does not exist" });

    if (session.userId !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    redisclient.del(`sess:${id}`);
    Session.findByIdAndUpdate(id, {
      isActive: false,
      destroyedAt: Date.now(),
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

/**
 *
 * delete record from mongodb
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} _
 */
exports.delete = async (req, res, _) => {
  try {
    const id = req.params.id;
    const session = await Session.findByIdAndDelete(id);
    if (session.userId !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json(id);
  } catch (error) {
    res.status(400).json(error);
  }
};
