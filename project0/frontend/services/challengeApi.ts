
const API_URL = "http://localhost:8080/api/challenges";

// TYPES

export type ChallengeActivity = {
  _id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

export type Challenge = {
  _id: string;
  userId: string;
  title: string;
  category: string;
  target: number;
  activities: ChallengeActivity[];
  status: "In Progress" | "Completed";
  createdAt: string;
  updatedAt: string;
};

type ChallengeResponse = {
  message: string;
  challenge: Challenge;
};

type ChallengesResponse = {
  message: string;
  challenges: Challenge[];
};

// AUTHENTICATION

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// HANDLE API RESPONSES

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data as T;
}

// GET ALL CHALLENGES

export async function getChallenges(): Promise<Challenge[]> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data =
    await handleResponse<ChallengesResponse>(response);

  return data.challenges;
}

// CREATE CHALLENGE

export async function createChallenge(data: {
  title: string;
  category: string;
}): Promise<Challenge> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result =
    await handleResponse<ChallengeResponse>(response);

  return result.challenge;
}

// ADD ACTIVITY TO CHALLENGE

export async function addChallengeActivity(
  challengeId: string,
  title: string
): Promise<Challenge> {
  const response = await fetch(
    `${API_URL}/${challengeId}/activities`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    }
  );

  const data =
    await handleResponse<ChallengeResponse>(response);

  return data.challenge;
}

// COMPLETE OR UNCHECK ACTIVITY

export async function updateChallengeActivity(
  challengeId: string,
  activityId: string,
  completed: boolean
): Promise<Challenge> {
  const response = await fetch(
    `${API_URL}/${challengeId}/activities/${activityId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    }
  );

  const data =
    await handleResponse<ChallengeResponse>(response);

  return data.challenge;
}

// DELETE ACTIVITY

export async function deleteChallengeActivity(
  challengeId: string,
  activityId: string
): Promise<Challenge> {
  const response = await fetch(
    `${API_URL}/${challengeId}/activities/${activityId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const data =
    await handleResponse<ChallengeResponse>(response);

  return data.challenge;
}

// DELETE CHALLENGE

export async function deleteChallenge(
  challengeId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/${challengeId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse<{ message: string }>(response);
}
