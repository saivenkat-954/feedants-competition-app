export type CompetitionLifecycle =
  | "UPCOMING"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "SUBMISSION_OPEN"
  | "SUBMISSION_CLOSED"
  | "RESULTS";

export function getCompetitionLifecycle(competition: {
  registrationStart: string;
  registrationEnd: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
}): CompetitionLifecycle {
  const now = new Date();

  const registrationStart = new Date(
    competition.registrationStart
  );

  const registrationEnd = new Date(
    competition.registrationEnd
  );

  const submissionStart = new Date(
    competition.submissionStart
  );

  const submissionEnd = new Date(
    competition.submissionEnd
  );

  const resultDate = new Date(
    competition.resultDate
  );

  if (now < registrationStart) {
    return "UPCOMING";
  }

  if (
    now >= registrationStart &&
    now <= registrationEnd
  ) {
    return "REGISTRATION_OPEN";
  }

  if (
    now > registrationEnd &&
    now < submissionStart
  ) {
    return "REGISTRATION_CLOSED";
  }

  if (
    now >= submissionStart &&
    now <= submissionEnd
  ) {
    return "SUBMISSION_OPEN";
  }

  if (
    now > submissionEnd &&
    now < resultDate
  ) {
    return "SUBMISSION_CLOSED";
  }

  return "RESULTS";
}