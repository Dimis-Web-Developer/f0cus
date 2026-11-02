
const API_URL = "http://localhost:8080/api/goals";

export type Goal = {
  _id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in again");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data as T;
}

export async function getGoals() {
  const data = await request<{
    message: string;
    goals: Goal[];
  }>("");
  return data.goals;
}

export async function createGoal(title: string) {
  const data = await request<{
    message: string;
    goal: Goal;
  }>("", {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  return data.goal;
}

export async function updateGoal(
  id: string,
  completed: boolean
) {
  const data = await request<{
    message: string;
    goal: Goal;
  }>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });

  return data.goal;
}

export async function deleteGoal(id: string) {
  return request<{ message: string }>(`/${id}`, {
    method: "DELETE",
  });
}
