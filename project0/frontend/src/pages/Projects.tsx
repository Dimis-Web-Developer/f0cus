
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "../../services/projectApi";

import {
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  type ProjectTask,
} from "../../services/projectTaskApi";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [projectTasks, setProjectTasks] = useState<
    Record<string, ProjectTask[]>
  >({});

  const [taskTitles, setTaskTitles] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [busyTaskIds, setBusyTaskIds] = useState<string[]>([]);
  const [savingTaskIds, setSavingTaskIds] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Error handling
  const handleError = (err: unknown) => {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );
    setSuccess("");
  };

  // Load projects and tasks
  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const savedProjects = await getProjects();

        if (!active) return;

        setProjects(savedProjects);

        const results = await Promise.allSettled(
          savedProjects.map(async (project) => ({
            projectId: project._id,
            tasks: await getProjectTasks(project._id),
          }))
        );

        if (!active) return;

        const tasksByProject: Record<string, ProjectTask[]> = {};
        let failed = false;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            tasksByProject[result.value.projectId] =
              result.value.tasks;
          } else {
            failed = true;
            console.error(
              "Failed to load tasks:",
              savedProjects[index]._id,
              result.reason
            );
          }
        });

        setProjectTasks(tasksByProject);

        if (failed) {
          setError("Some project tasks could not be loaded.");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load projects."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  // Statistics
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const activeProjects = projects.length - completedProjects;

  // Create project
  const addProject = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim() || saving || loading) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const newProject = await createProject(
        title.trim(),
        description.trim()
      );

      setProjects((previous) => [
        newProject,
        ...previous,
      ]);

      setProjectTasks((previous) => ({
        ...previous,
        [newProject._id]: [],
      }));

      setTitle("");
      setDescription("");
      setSuccess("Project created successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  // Change project status
  const toggleStatus = async (project: Project) => {
    const projectId = project._id;
    const tasks = projectTasks[projectId] || [];

    if (
      busyIds.includes(projectId) ||
      savingTaskIds.includes(projectId) ||
      tasks.some((task) => busyTaskIds.includes(task._id))
    ) {
      return;
    }

    const allTasksCompleted =
      tasks.length > 0 &&
      tasks.every((task) => task.completed);

    if (
      project.status !== "Completed" &&
      !allTasksCompleted
    ) {
      setError(
        "Complete all project tasks before marking the project as completed."
      );
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");

    setBusyIds((previous) => [
      ...previous,
      projectId,
    ]);

    const nextStatus =
      project.status === "Completed"
        ? "In Progress"
        : "Completed";

    try {
      const updatedProject = await updateProject(
        projectId,
        { status: nextStatus }
      );

      setProjects((previous) =>
        previous.map((item) =>
          item._id === projectId
            ? updatedProject
            : item
        )
      );

      setSuccess(
        nextStatus === "Completed"
          ? "Project marked as completed."
          : "Project marked as in progress."
      );
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIds((previous) =>
        previous.filter((id) => id !== projectId)
      );
    }
  };

  // Delete project
  const removeProject = async (id: string) => {
    const tasks = projectTasks[id] || [];

    if (
      busyIds.includes(id) ||
      savingTaskIds.includes(id) ||
      tasks.some((task) => busyTaskIds.includes(task._id))
    ) {
      return;
    }

    setError("");
    setSuccess("");

    setBusyIds((previous) => [...previous, id]);

    try {
      await deleteProject(id);

      setProjects((previous) =>
        previous.filter((project) => project._id !== id)
      );

      setProjectTasks((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      setTaskTitles((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });

      setSuccess("Project deleted successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIds((previous) =>
        previous.filter((item) => item !== id)
      );
    }
  };

  // Add task
  const addTask = async (
    e: FormEvent<HTMLFormElement>,
    projectId: string
  ) => {
    e.preventDefault();

    const taskTitle = taskTitles[projectId]?.trim();
    const tasks = projectTasks[projectId] || [];

    if (
      !taskTitle ||
      savingTaskIds.includes(projectId) ||
      busyIds.includes(projectId) ||
      tasks.some((task) => busyTaskIds.includes(task._id))
    ) {
      return;
    }

    setError("");
    setSuccess("");

    setSavingTaskIds((previous) => [
      ...previous,
      projectId,
    ]);

    try {
      const newTask = await createProjectTask(
        projectId,
        taskTitle
      );

      setProjectTasks((previous) => ({
        ...previous,
        [projectId]: [
          newTask,
          ...(previous[projectId] || []),
        ],
      }));

      setTaskTitles((previous) => ({
        ...previous,
        [projectId]: "",
      }));

      // Reopen completed project when a task is added
      const project = projects.find(
        (item) => item._id === projectId
      );

      if (project?.status === "Completed") {
        const updatedProject = await updateProject(
          projectId,
          { status: "In Progress" }
        );

        setProjects((previous) =>
          previous.map((item) =>
            item._id === projectId
              ? updatedProject
              : item
          )
        );
      }

      setSuccess("Task added successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setSavingTaskIds((previous) =>
        previous.filter((id) => id !== projectId)
      );
    }
  };

  // Complete or uncomplete task
  const toggleTask = async (
    projectId: string,
    task: ProjectTask
  ) => {
    if (
      busyTaskIds.includes(task._id) ||
      busyIds.includes(projectId) ||
      savingTaskIds.includes(projectId)
    ) {
      return;
    }

    setError("");
    setSuccess("");

    setBusyTaskIds((previous) => [
      ...previous,
      task._id,
    ]);

    try {
      const updatedTask = await updateProjectTask(
        projectId,
        task._id,
        !task.completed
      );

      setProjectTasks((previous) => ({
        ...previous,
        [projectId]: (
          previous[projectId] || []
        ).map((item) =>
          item._id === task._id
            ? updatedTask
            : item
        ),
      }));

      // Reopen project if a completed task is unchecked
      const project = projects.find(
        (item) => item._id === projectId
      );

      if (
        project?.status === "Completed" &&
        !updatedTask.completed
      ) {
        const updatedProject = await updateProject(
          projectId,
          { status: "In Progress" }
        );

        setProjects((previous) =>
          previous.map((item) =>
            item._id === projectId
              ? updatedProject
              : item
          )
        );
      }

      setSuccess(
        updatedTask.completed
          ? "Task marked as completed."
          : "Task marked as pending."
      );
    } catch (err) {
      handleError(err);
    } finally {
      setBusyTaskIds((previous) =>
        previous.filter((id) => id !== task._id)
      );
    }
  };

  // Delete task
  const removeTask = async (
    projectId: string,
    taskId: string
  ) => {
    if (
      busyTaskIds.includes(taskId) ||
      busyIds.includes(projectId) ||
      savingTaskIds.includes(projectId)
    ) {
      return;
    }

    setError("");
    setSuccess("");

    setBusyTaskIds((previous) => [
      ...previous,
      taskId,
    ]);

    try {
      await deleteProjectTask(projectId, taskId);

      setProjectTasks((previous) => ({
        ...previous,
        [projectId]: (
          previous[projectId] || []
        ).filter((task) => task._id !== taskId),
      }));

      const project = projects.find(
        (item) => item._id === projectId
      );

      const remainingTasks = (
        projectTasks[projectId] || []
      ).filter((task) => task._id !== taskId);

      // Reopen completed project if no tasks remain
      if (
        project?.status === "Completed" &&
        remainingTasks.length === 0
      ) {
        const updatedProject = await updateProject(
          projectId,
          { status: "In Progress" }
        );

        setProjects((previous) =>
          previous.map((item) =>
            item._id === projectId
              ? updatedProject
              : item
          )
        );
      }

      setSuccess("Task deleted successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusyTaskIds((previous) =>
        previous.filter((id) => id !== taskId)
      );
    }
  };

  return (
    <main className="w-full min-w-0 p-3 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Project Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Projects
          </h1>

          <p className="mt-2 text-slate-500">
            Organise your projects, manage your tasks
            and track your progress.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="min-w-0 break-words">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
              className="shrink-0 rounded-lg px-2 py-1 text-lg font-bold hover:bg-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Success alert */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <span className="min-w-0 break-words">
              ✓ {success}
            </span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="shrink-0 rounded-lg px-2 py-1 text-lg font-bold hover:bg-emerald-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Projects
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {loading ? "—" : projects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Projects
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {loading ? "—" : activeProjects}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {loading ? "—" : completedProjects}
            </p>
          </div>
        </div>

        {/* Main project layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* My Projects
          */}
          <section className="order-2 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:order-1 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              My Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep track of everything you're working on.
            </p>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center">
                  <p className="font-medium text-slate-700">
                    No projects created yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Create your first project to get started.
                  </p>
                </div>
              ) : (
                projects.map((project) => {
                  const tasks =
                    projectTasks[project._id] || [];

                  const completedTasks = tasks.filter(
                    (task) => task.completed
                  ).length;

                  const progress = tasks.length
                    ? Math.round(
                        (completedTasks / tasks.length) * 100
                      )
                    : 0;

                  const allTasksCompleted =
                    tasks.length > 0 &&
                    tasks.every((task) => task.completed);

                  const canComplete =
                    project.status === "Completed" ||
                    allTasksCompleted;

                  const isProjectBusy =
                    busyIds.includes(project._id);

                  const isSavingTask =
                    savingTaskIds.includes(project._id);

                  const hasBusyTasks = tasks.some(
                    (task) => busyTaskIds.includes(task._id)
                  );

                  const controlsBusy =
                    isProjectBusy ||
                    isSavingTask ||
                    hasBusyTasks;

                  return (
                    <article
                      key={project._id}
                      className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
                    >
                      {/* Project information */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-900">
                            {project.title}
                          </h3>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            {project.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={controlsBusy}
                          onClick={() =>
                            removeProject(project._id)
                          }
                          className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Project progress */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-blue-600">
                          {project.status}
                        </span>

                        <span className="text-xs text-slate-500">
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${project.title} progress`}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {completedTasks} of {tasks.length} tasks completed
                      </p>

                      {/* Task list */}
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <h4 className="mb-3 text-sm font-semibold text-slate-800">
                          Project Tasks
                        </h4>

                        <div className="space-y-3">
                          {tasks.length === 0 ? (
                            <p className="text-sm text-slate-400">
                              No tasks added yet.
                            </p>
                          ) : (
                            tasks.map((task) => (
                              <div
                                key={task._id}
                                className="flex items-center justify-between gap-3"
                              >
                                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    disabled={controlsBusy}
                                    onChange={() =>
                                      toggleTask(
                                        project._id,
                                        task
                                      )
                                    }
                                    className="h-4 w-4 shrink-0 accent-blue-600 disabled:cursor-not-allowed"
                                  />

                                  <span
                                    className={`min-w-0 break-words text-sm ${
                                      task.completed
                                        ? "text-slate-400 line-through"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                </label>

                                <button
                                  type="button"
                                  disabled={controlsBusy}
                                  onClick={() =>
                                    removeTask(
                                      project._id,
                                      task._id
                                    )
                                  }
                                  className="shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                                          
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <form
                          onSubmit={(e) =>
                            addTask(e, project._id)
                          }
                          className="flex w-full min-w-0 items-center gap-2"
                        >
                          <input
                            type="text"
                            value={
                              taskTitles[project._id] || ""
                            }
                            onChange={(e) =>
                              setTaskTitles((previous) => ({
                                ...previous,
                                [project._id]:
                                  e.target.value,
                              }))
                            }
                            placeholder="Add task..."
                            aria-label={`New task for ${project.title}`}
                            required
                            disabled={controlsBusy}
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 sm:px-3 sm:text-sm"
                          />

                          {/* Add button */}
                          <button
                            type="submit"
                            disabled={
                              controlsBusy ||
                              !(
                                taskTitles[project._id] || ""
                              ).trim()
                            }
                            className="shrink-0 cursor-pointer rounded-lg bg-blue-600 px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 sm:px-4 sm:text-sm"
                          >
                            {isSavingTask
                              ? "Adding..."
                              : "Add"}
                          </button>

                          {/* Complete button */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(project)
                            }
                            disabled={
                              controlsBusy ||
                              !canComplete
                            }
                            className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-blue-600  px-2 py-3 text-[10px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-white disabled:hover:bg-gray-400 sm:px-4 sm:text-sm"
                          >
                            <span className="sm:hidden">
                              {project.status === "Completed"
                                ? "In Progress"
                                : "Complete"}
                            </span>

                            <span className="hidden sm:inline">
                              {project.status === "Completed"
                                ? " In Progress"
                                : " Completed"}
                            </span>
                          </button>
                        </form>

                        {!canComplete && (
                          <p className="mt-3 text-xs text-slate-500">
                            Complete all project tasks to unlock project completion.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Create Project:*/}
          <section className="order-1 h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:order-2">
            <h2 className="text-xl font-bold text-slate-900">
              Create Project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              What would you like to work on?
            </p>

            <form
              onSubmit={addProject}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="project-title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Project Title
                </label>

                <input
                  id="project-title"
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Build Portfolio Website"
                  required
                  disabled={saving || loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe your project..."
                  rows={4}
                  disabled={saving || loading}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  !title.trim()
                }
                className="w-full rounded-xl cursor-pointer bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "+ Create Project"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Projects;
