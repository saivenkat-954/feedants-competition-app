const express = require("express");

const {
  submitEntry,
  getSubmissionStatus,
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/:id/submit", submitEntry);

router.get("/:id/submission-status", getSubmissionStatus);

module.exports = router;