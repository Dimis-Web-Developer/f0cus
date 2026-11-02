import { useEffect, useState } from "react";

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

  const handleError = (error: unknown) => {
    setError(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  };

  // Load projects and their tasks
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

        const tasksByProject: Record<
          string,
          ProjectTask[]
        > = {};

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
          setError(
            "Some project tasks could not be loaded."
          );
        }
      } catch (error) {
        if (active) {
          handleError(error);
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

  // Project statistics
  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const activeProjects =
    projects.length - completedProjects;



  // Create project
  const addProject = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim() || saving) return;

    setError("");
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
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  // Change project status
  const toggleStatus = async (project: Project) => {
    if (busyIds.includes(project._id)) return;

    const tasks = projectTasks[project._id] || [];

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
      return;
    }

    setError("");
    setBusyIds((previous) => [
      ...previous,
      project._id,
    ]);

    const nextStatus =
      project.status === "Completed"
        ? "In Progress"
        : "Completed";

    try {
      const updatedProject = await updateProject(
        project._id,
        { status: nextStatus }
      );

      setProjects((previous) =>
        previous.map((item) =>
          item._id === project._id
            ? updatedProject
            : item
        )
      );
    } catch (error) {
      handleError(error);
    } finally {
      setBusyIds((previous) =>
        previous.filter((id) => id !== project._id)
      );
    }
  };

  // Delete project
  const removeProject = async (id: string) => {
    if (busyIds.includes(id)) return;

    setError("");
    setBusyIds((previous) => [
      ...previous,
      id,
    ]);

    try {
      await deleteProject(id);

      setProjects((previous) =>
        previous.filter(
          (project) => project._id !== id
        )
      );

      setProjectTasks((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      handleError(error);
    } finally {
      setBusyIds((previous) =>
        previous.filter((item) => item !== id)
      );
    }
  };

  // Add a task inside a project
  const addTask = async (
    e: React.FormEvent<HTMLFormElement>,
    projectId: string
  ) => {
    e.preventDefault();

    const taskTitle =
      taskTitles[projectId]?.trim();

    if (
      !taskTitle ||
      savingTaskIds.includes(projectId) ||
      busyIds.includes(projectId)
    ) {
      return;
    }

    setError("");
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

      // A new incomplete task reopens a completed project
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
    } catch (error) {
      handleError(error);
    } finally {
      setSavingTaskIds((previous) =>
        previous.filter((id) => id !== projectId)
      );
    }
  };

  // Complete or uncomplete a task
  const toggleTask = async (
    projectId: string,
    task: ProjectTask
  ) => {
    if (
      busyTaskIds.includes(task._id) ||
      busyIds.includes(projectId)
    ) {
      return;
    }

    setError("");
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
    } catch (error) {
      handleError(error);
    } finally {
      setBusyTaskIds((previous) =>
        previous.filter(
          (id) => id !== task._id
        )
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
      busyIds.includes(projectId)
    ) {
      return;
    }

    setError("");
    setBusyTaskIds((previous) => [
      ...previous,
      taskId,
    ]);

    try {
      await deleteProjectTask(
        projectId,
        taskId
      );

      setProjectTasks((previous) => ({
        ...previous,
        [projectId]: (
          previous[projectId] || []
        ).filter(
          (task) => task._id !== taskId
        ),
      }));

      // Reopen a completed project if no tasks remain
      const project = projects.find(
        (item) => item._id === projectId
      );

      const remainingTasks = (
        projectTasks[projectId] || []
      ).filter((task) => task._id !== taskId);

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
    } catch (error) {
      handleError(error);
    } finally {
      setBusyTaskIds((previous) =>
        previous.filter(
          (id) => id !== taskId
        )
      );
    }
  };

  return (
    <main className="w-full p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
    Project Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Projects
        </h1>

        <p className="mt-2 text-slate-500">
          Organise your projects, manage your tasks and track your progress.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Projects
          </p>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {projects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Projects
          </p>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {activeProjects}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed
          </p>
          <p className="mt-3 text-3xl font-bold text-blue-600">
            {completedProjects}
          </p>
        </div>
      </div>

      {/* Project content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project list */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">
            My Projects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep track of everything you're working on.
          </p>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-slate-500">
                  Loading projects...
                </p>
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

                return (
                  <div
                    key={project._id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    {/* Project details */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {project.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {project.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={busyIds.includes(project._id)}
                        onClick={() =>
                          removeProject(project._id)
                        }
                        className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600">
                        {project.status}
                      </span>

                      <span className="text-xs text-slate-500">
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Project tasks */}
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
                              <label className="flex flex-1 cursor-pointer items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  disabled={
                                    busyTaskIds.includes(task._id) ||
                                    busyIds.includes(project._id)
                                  }
                                  onChange={() =>
                                    toggleTask(project._id, task)
                                  }
                                  className="h-4 w-4 accent-blue-600"
                                />

                                <span
                                  className={
                                    task.completed
                                      ? "text-sm text-slate-400 line-through"
                                      : "text-sm text-slate-700"
                                  }
                                >
                                  {task.title}
                                </span>
                              </label>

                              <button
                                type="button"
                                disabled={
                                  busyTaskIds.includes(task._id) ||
                                  busyIds.includes(project._id)
                                }
                                onClick={() =>
                                  removeTask(
                                    project._id,
                                    task._id
                                  )
                                }
                                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add task form */}
                      <form
                        onSubmit={(e) =>
                          addTask(e, project._id)
                        }
                        className="mt-4 flex gap-2"
                      >
                        <input
                          type="text"
                          value={taskTitles[project._id] || ""}
                          onChange={(e) =>
                            setTaskTitles((previous) => ({
                              ...previous,
                              [project._id]: e.target.value,
                            }))
                          }
                          placeholder="Add a project task..."
                          required
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                          type="submit"
                          disabled={
                            savingTaskIds.includes(project._id) ||
                            busyIds.includes(project._id)
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900  disabled:opacity-50"
                        >
                          {savingTaskIds.includes(project._id)
                            ? "Adding..."
                            : "Add"}
                        </button>
                      </form>
                    </div>

                    {/* Completion button BELOW tasks */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(project)
                        }
                        disabled={
                          busyIds.includes(project._id) ||
                          savingTaskIds.includes(project._id) ||
                          !canComplete
                        }
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400"
                      >
                        {project.status === "Completed"
                          ? "Mark In Progress"
                          : "Mark Completed"}
                      </button>

                      {!canComplete && (
                        <p className="mt-2 text-center text-xs text-slate-500">
                          Complete all project tasks to unlock project completion.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Create project form */}
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Create Project
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            What would you like to work on?
          </p>

          <form onSubmit={addProject} className="mt-6 space-y-4">
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build Portfolio Website"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "+ Create Project"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Projects;
