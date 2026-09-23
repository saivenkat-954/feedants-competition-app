const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },

    userId: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  {
    competition: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);