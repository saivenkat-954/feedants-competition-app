import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCompetition = async (
  competitionId: string
) => {
  const response = await api.get(
    `/competitions/${competitionId}`
  );

  return response.data;
};

export const getRegistrationStatus = async (
  competitionId: string,
  userId: string
) => {
  const response = await api.get(
    `/competitions/${competitionId}/registration-status`,
    {
      params: {
        userId,
      },
    }
  );

  return response.data;
};

export const registerForCompetition = async (
  competitionId: string,
  userId: string
) => {
  const response = await api.post(
    `/competitions/${competitionId}/register`,
    {
      userId,
    }
  );

  return response.data;
};

export const getSubmissionStatus = async (
  competitionId: string,
  userId: string
) => {
  const response = await api.get(
    `/competitions/${competitionId}/submission-status`,
    {
      params: {
        userId,
      },
    }
  );

  return response.data;
};

export const submitCompetitionEntry = async (
  competitionId: string,
  userId: string,
  fileName: string,
  fileUrl: string
) => {
  const response = await api.post(
    `/competitions/${competitionId}/submit`,
    {
      userId,
      fileName,
      fileUrl,
    }
  );

  return response.data;
};

export default api;