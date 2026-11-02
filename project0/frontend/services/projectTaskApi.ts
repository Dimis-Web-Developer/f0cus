
const API_URL = "http://localhost:8080/api/projects";

export type ProjectTask = {
  _id: string;
  projectId: string;
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

// GET — Retrieve tasks for one project
export async function getProjectTasks(projectId: string) {
  const data = await request<{
    message: string;
    tasks: ProjectTask[];
  }>(`/${projectId}/tasks`);

  return data.tasks;
}

// POST — Add a task to a project
export async function createProjectTask(
  projectId: string,
  title: string
) {
  const data = await request<{
    message: string;
    task: ProjectTask;
  }>(`/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  return data.task;
}

// PATCH — Mark a task completed or incomplete
export async function updateProjectTask(
  projectId: string,
  taskId: string,
  completed: boolean
) {
  const data = await request<{
    message: string;
    task: ProjectTask;
  }>(`/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });

  return data.task;
}

// DELETE — Remove a task
export async function deleteProjectTask(
  projectId: string,
  taskId: string
) {
  return request<{ message: string }>(
    `/${projectId}/tasks/${taskId}`,
    { method: "DELETE" }
  );
}
