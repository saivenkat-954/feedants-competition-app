const express = require("express");

const {
  getCompetitionById,
  registerForCompetition,
  getRegistrationStatus,
} = require("../controllers/competitionController");

const router = express.Router();

router.get(
  "/:id",
  getCompetitionById
);

router.post(
  "/:id/register",
  registerForCompetition
);

router.get(
  "/:id/registration-status",
  getRegistrationStatus
);

module.exports = router;