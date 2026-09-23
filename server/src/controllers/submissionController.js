const mongoose = require("mongoose");
const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");

const submitEntry = async (req, res) => {
  const { id } = req.params;
  const { userId, fileName, fileUrl } = req.body;

  if (!userId || !fileName || !fileUrl) {
    return res.status(400).json({
      success: false,
      message: "userId, fileName and fileUrl are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid competition ID",
    });
  }

  try {
    const competition = await Competition.findById(id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    const now = new Date();

    if (
      now < new Date(competition.submissionStart) ||
      now > new Date(competition.submissionEnd)
    ) {
      return res.status(400).json({
        success: false,
        message: "Submission is not currently open",
      });
    }

    const registration = await Registration.findOne({
      competition: id,
      userId,
      status: "registered",
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You must register before submitting",
      });
    }

    const existingSubmission = await Submission.findOne({
      competition: id,
      userId,
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted your entry",
        data: existingSubmission,
      });
    }

    const submission = await Submission.create({
      competition: id,
      userId,
      fileName,
      fileUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Submission uploaded successfully",
      data: submission,
    });
  } catch (error) {
    if (error.code === 11000) {
      const submission = await Submission.findOne({
        competition: id,
        userId,
      });

      return res.status(409).json({
        success: false,
        message: "You have already submitted your entry",
        data: submission,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit entry",
    });
  }
};

const getSubmissionStatus = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid competition ID",
    });
  }

  try {
    const submission = await Submission.findOne({
      competition: id,
      userId,
    });

    return res.json({
      success: true,
      submitted: Boolean(submission),
      data: submission || null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get submission status",
    });
  }
};

module.exports = {
  submitEntry,
  getSubmissionStatus,
};