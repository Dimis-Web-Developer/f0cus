
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from "../../services/goalApi";

function DashBoard() {
  // -------------------------
  // State
  // -------------------------

  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { logout } = useAuth();

  // -------------------------
  // Error handling
  // -------------------------

  const isAuthError = (message: string) => {
    return [
      "Invalid or expired token",
      "Authentication required",
      "Please log in again",
    ].includes(message);
  };

  const handleError = (err: unknown) => {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.";

    setError(message);
    setSuccess("");

    if (isAuthError(message)) {
      logout();
    }
  };

  // -------------------------
  // Load goals from backend
  // -------------------------

  useEffect(() => {
    let active = true;

    async function loadGoals() {
      setLoading(true);

      try {
        const savedGoals = await getGoals();

        if (!active) return;

        setGoals(savedGoals);
        setError("");
      } catch (err) {
        if (!active) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load goals.";

        setError(message);

        if (isAuthError(message)) {
          logout();
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGoals();

    return () => {
      active = false;
    };
  }, [logout]);

  // -------------------------
  // Dashboard statistics
  // -------------------------

  const totalGoals = goals.length;

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const pendingGoals = totalGoals - completedGoals;

  const progress =
    totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;

  // -------------------------
  // Create goal
  // -------------------------

  const addGoal = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const newGoal = await createGoal(trimmedTitle);

      setGoals((previous) => [
        newGoal,
        ...previous,
      ]);

      setTitle("");
      setSuccess("Goal created successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // Complete / uncomplete goal
  // -------------------------

  const toggleGoal = async (goal: Goal) => {
    if (busyIds.includes(goal._id)) return;

    setError("");
    setSuccess("");

    setBusyIds((previous) => [
      ...previous,
      goal._id,
    ]);

    try {
      const updatedGoal = await updateGoal(
        goal._id,
        !goal.completed
      );

      setGoals((previous) =>
        previous.map((item) =>
          item._id === goal._id
            ? updatedGoal
            : item
        )
      );

      setSuccess(
        updatedGoal.completed
          ? "Goal marked as completed."
          : "Goal marked as pending."
      );
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIds((previous) =>
        previous.filter(
          (id) => id !== goal._id
        )
      );
    }
  };

  // -------------------------
  // Delete goal
  // -------------------------

  const removeGoal = async (id: string) => {
    if (busyIds.includes(id)) return;

    setError("");
    setSuccess("");

    setBusyIds((previous) => [
      ...previous,
      id,
    ]);

    try {
      await deleteGoal(id);

      setGoals((previous) =>
        previous.filter(
          (goal) => goal._id !== id
        )
      );

      setSuccess("Goal deleted successfully.");
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIds((previous) =>
        previous.filter(
          (item) => item !== id
        )
      );
    }
  };

  // -------------------------
  // Dashboard UI
  // -------------------------

  return (
    <main className="w-full min-w-0 p-3 sm:p-6 lg:p-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Your personal workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Stay focused, manage your goals and track your progress.
          </p>
        </div>

        {/* Dismissible error alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden="true"
                className="shrink-0 text-lg"
              >
                !
              </span>

              <span className="min-w-0 break-words">
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg font-bold hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}

        {/* Dismissible success alert */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <div className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden="true"
                className="shrink-0 text-lg"
              >
                ✓
              </span>

              <span className="min-w-0 break-words">
                {success}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg font-bold hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}

        {/* Main dashboard */}
        <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">

          {/* Dashboard header */}
          <div className="bg-slate-900 px-5 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              FOCUS Dashboard
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Welcome back!
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Small steps today. Big results tomorrow.
            </p>
          </div>

          <div className="min-w-0 space-y-8 p-3 sm:p-6 lg:p-8">

            {/* Statistics cards */}
            <section
              aria-label="Goal statistics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >

              {/* Total goals */}
              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Total Goals
                  </p>

                  <span
                    aria-hidden="true"
                    className="text-xl text-blue-600"
                  >
                    ◎
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-blue-600">
                  {loading ? "—" : totalGoals}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Goals you've created
                </p>
              </div>

              {/* Completed goals */}
              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Completed Goals
                  </p>

                  <span
                    aria-hidden="true"
                    className="text-xl text-emerald-600"
                  >
                    ✓
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-emerald-600">
                  {loading ? "—" : completedGoals}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Goals achieved
                </p>
              </div>

              {/* Goal progress */}
              <div className="rounded-2xl bg-orange-50 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Goal Progress
                  </p>

                  <span
                    aria-hidden="true"
                    className="text-xl text-orange-600"
                  >
                    ↗
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-orange-600">
                  {loading ? "—" : `${progress}%`}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Overall completion rate
                </p>
              </div>
            </section>

            {/* Goals management */}
            <section className="min-w-0 rounded-2xl border border-slate-200 p-3 sm:p-6">

              {/* Goals heading */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    My Goals
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create, manage and complete your goals.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {loading
                    ? "Loading..."
                    : `${completedGoals} of ${totalGoals} done`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between gap-3 text-xs font-medium text-slate-500">
                  <span>Overall progress</span>

                  <span>
                    {loading ? "—" : `${progress}%`}
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Overall goals progress"
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
              </div>

              {/* Create goal form */}
              <div className="mt-7 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
                <h4 className="text-base font-bold text-slate-900">
                  Create a Goal
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  What would you like to achieve?
                </p>

                <form
                  onSubmit={addGoal}
                  className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="goal-title"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Goal Title
                    </label>

                    <input
                      id="goal-title"
                      type="text"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      placeholder="e.g. Practise JavaScript"
                      required
                      maxLength={120}
                      disabled={saving || loading}
                      className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loading ||
                      !title.trim()
                    }
                    className="min-h-11 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Adding..."
                      : "+ Add Goal"}
                  </button>
                </form>
              </div>

              {/* Goals list */}
              <div className="mt-7 min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900">
                    Your Goals
                  </h4>

                  {!loading && (
                    <span className="text-xs font-medium text-slate-500">
                      {pendingGoals} pending
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div
                      role="status"
                      className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500"
                    >
                      Loading your goals...
                    </div>
                  ) : goals.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <p className="font-semibold text-slate-700">
                        No goals created yet.
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Create your first goal to start tracking your progress.
                      </p>
                    </div>
                  ) : (
                    goals.map((goal) => {
                      const isBusy =
                        busyIds.includes(goal._id);

                      return (
                        <div
                          key={goal._id}
                          className="min-w-0 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            {/* Checkbox and goal title */}
                            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={goal.completed}
                                disabled={isBusy}
                                onChange={() =>
                                  toggleGoal(goal)
                                }
                                className="h-5 w-5 shrink-0 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                              />

                              <span
                                className={`min-w-0 flex-1 whitespace-normal break-words text-sm font-medium leading-6 ${
                                  goal.completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {goal.title}
                              </span>
                            </label>

                            {/* Status and delete */}
                            <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end">

                              {/* Status */}
                              <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                  goal.completed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {goal.completed
                                  ? "Completed"
                                  : "Pending"}
                              </span>

                              {/* Delete button */}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                  removeGoal(goal._id)
                                }
                                aria-label={`Delete ${goal.title}`}
                                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isBusy
                                  ? "Please wait..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Automation preview */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="text-lg text-slate-400"
                  >
                    ↻
                  </span>

                  <p className="text-sm text-slate-500">
                    Recurring goals and reminders coming soon
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  Automation coming soon
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default DashBoard;
