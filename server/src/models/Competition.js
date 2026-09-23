const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    position: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const winnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const judgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profession: String,
    experience: String,
    image: String,
    introVideo: String,
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    tags: [String],

    prizePool: {
      type: Number,
      required: true,
      min: 0,
    },

    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },

    registeredParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },

    registrationStart: {
      type: Date,
      required: true,
    },

    registrationEnd: {
      type: Date,
      required: true,
    },

    submissionStart: {
      type: Date,
      required: true,
    },

    submissionEnd: {
      type: Date,
      required: true,
    },

    resultDate: {
      type: Date,
      required: true,
    },

    judge: judgeSchema,

    rewards: [rewardSchema],

    previousWinners: [winnerSchema],

    description: {
      type: String,
      default: "",
    },

    judgingParameters: [String],

    rules: [String],

    status: {
      type: String,
      enum: [
        "draft",
        "upcoming",
        "registration_open",
        "registration_closed",
        "submission_open",
        "completed",
      ],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Competition", competitionSchema);