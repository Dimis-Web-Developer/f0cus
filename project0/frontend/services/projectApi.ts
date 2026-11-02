
const API_URL = "http://localhost:8080/api/projects";

export type Project = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  status: "In Progress" | "Completed";
  progress: number;
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

// GET — Retrieve all projects
export async function getProjects() {
  const data = await request<{
    message: string;
    projects: Project[];
  }>("");

  return data.projects;
}

// POST — Create a project
export async function createProject(
  title: string,
  description: string
) {
  const data = await request<{
    message: string;
    project: Project;
  }>("", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });

  return data.project;
}

// PATCH — Update a project
export async function updateProject(
  id: string,
  updates: Partial<
    Pick<Project, "title" | "description" | "status">
  >
) {
  const data = await request<{
    message: string;
    project: Project;
  }>(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return data.project;
}

// DELETE — Remove a project
export async function deleteProject(id: string) {
  return request<{ message: string }>(`/${id}`, {
    method: "DELETE",
  });
}
