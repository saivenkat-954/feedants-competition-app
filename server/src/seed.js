require("dotenv").config();

const mongoose = require("mongoose");
const Competition = require("./models/Competition");

const competition = {
  title: "Feedants Classical Dance",

  category: "Dance",

  tags: [
    "Dance",
    "Multi-Win",
  ],

  prizePool: 1500,

  entryFee: 99,

  maxParticipants: 20,

  registeredParticipants: 1,

  registrationStart: new Date(
    "2026-09-20T04:00:00"
  ),

  registrationEnd: new Date(
    "2026-09-30T23:50:00"
  ),

  submissionStart: new Date(
    "2026-10-01T04:00:00"
  ),

  submissionEnd: new Date(
    "2026-10-05T23:55:00"
  ),

  resultDate: new Date(
    "2026-10-06T23:50:00"
  ),

  judge: {
    name: "Manju Dubey",
    profession:
      "Professional Kathak Dancer",
    experience:
      "12+ Years of Experience",
    image: "",
    introVideo: "",
  },

  rewards: [
    {
      position: 1,
      title: "1st Winner",
      amount: 550,
    },
    {
      position: 2,
      title: "2nd Winner",
      amount: 300,
    },
    {
      position: 3,
      title: "3rd Winner",
      amount: 240,
    },
    {
      position: 4,
      title: "4th Winner",
      amount: 200,
    },
    {
      position: 5,
      title: "5th Winner",
      amount: 130,
    },
    {
      position: 6,
      title: "6th Winner",
      amount: 80,
    },
  ],

  previousWinners: [
    {
      name: "Riya Shah",
      position: 1,
      image: "",
    },
    {
      name: "Aarav Mehta",
      position: 1,
      image: "",
    },
    {
      name: "Neha Verma",
      position: 2,
      image: "",
    },
    {
      name: "Ishita Chopra",
      position: 3,
      image: "",
    },
  ],

  description:
    "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.",

  judgingParameters: [
    "Technique",
    "Expression",
    "Creativity",
    "Presentation",
    "Overall Performance",
  ],

  rules: [
    "Competition is open for all age groups.",
    "Participants must submit their performance before the submission deadline.",
    "Only registered participants can submit entries.",
    "Participants must follow the competition guidelines.",
  ],

  status: "registration_open",
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "✅ MongoDB connected"
    );

    await Competition.deleteMany({});

    const createdCompetition =
      await Competition.create(
        competition
      );

    console.log(
      "✅ Competition created:"
    );

    console.log(
      createdCompetition._id.toString()
    );

    await mongoose.disconnect();

    console.log(
      "✅ Seed completed"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Seed failed:",
      error.message
    );

    process.exit(1);
  }
};

seedDatabase();