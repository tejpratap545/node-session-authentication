const User = require("../model/user");
const bcrypt = require("bcrypt");

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
