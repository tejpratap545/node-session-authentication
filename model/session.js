const mongoose = require("mongoose");

const SessionSchema = mongoose.Schema(
  {
    sessionId: String,
    lastActivate: Date,
    createdAt: Date,
    createdByIp: String,
    destroyedAt: Date,
    isActive: Boolean,
    userAgent: String,
  },

  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Session = mongoose.model("Session", SessionSchema);

module.exports = Session;
