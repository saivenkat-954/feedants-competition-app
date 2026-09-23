const mongoose = require("mongoose");
const Competition = require("../models/Competition");
const Registration = require("../models/Registration");

const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(
      req.params.id
    );

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    console.error(
      "Get competition error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch competition",
    });
  }
};

const registerForCompetition = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const { userId } = req.body;

    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const competitionId = req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(
        competitionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid competition ID",
      });
    }

    session.startTransaction();

    const competition =
      await Competition.findById(
        competitionId
      ).session(session);

    if (!competition) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    const now = new Date();

    if (now < competition.registrationStart) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Registration has not started yet",
      });
    }

    if (now > competition.registrationEnd) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Registration has closed",
      });
    }

    const existingRegistration =
      await Registration.findOne({
        competition: competitionId,
        userId: userId.trim(),
        status: "registered",
      }).session(session);

    if (existingRegistration) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "You are already registered for this competition",
        data: existingRegistration,
      });
    }

    const updatedCompetition =
      await Competition.findOneAndUpdate(
        {
          _id: competitionId,
          $expr: {
            $lt: [
              "$registeredParticipants",
              "$maxParticipants",
            ],
          },
        },
        {
          $inc: {
            registeredParticipants: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

    if (!updatedCompetition) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Registration is full",
      });
    }

    const registration =
      await Registration.create(
        [
          {
            competition: competitionId,
            userId: userId.trim(),
          },
        ],
        {
          session,
        }
      );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message:
        "Successfully registered for the competition",
      data: {
        registration:
          registration[0],
        competition: updatedCompetition,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You are already registered for this competition",
      });
    }

    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to register for competition",
    });
  } finally {
    await session.endSession();
  }
};

const getRegistrationStatus = async (
  req,
  res
) => {
  try {
    const { userId } = req.query;

    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const registration =
      await Registration.findOne({
        competition: req.params.id,
        userId: userId.trim(),
        status: "registered",
      });

    res.status(200).json({
      success: true,
      registered: !!registration,
      data: registration || null,
    });
  } catch (error) {
    console.error(
      "Registration status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to check registration status",
    });
  }
};

module.exports = {
  getCompetitionById,
  registerForCompetition,
  getRegistrationStatus,
};