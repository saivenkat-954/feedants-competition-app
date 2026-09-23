const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
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
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "withdrawn"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index(
  {
    competition: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Submission",
  submissionSchema
);