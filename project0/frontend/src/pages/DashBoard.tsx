
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from "../../services/goalApi";

function DashBoard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const { logout } = useAuth();

  useEffect(() => {
    let active = true;

    async function loadGoals() {
      try {
        const savedGoals = await getGoals();

        if (active) {
          setGoals(savedGoals);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load goals"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGoals();

    return () => {
      active = false;
    };
  }, []);

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    setError(message);

    if (
      message === "Invalid or expired token" ||
      message === "Authentication required" ||
      message === "Please log in again"
    ) {
      logout();
    }
  };

  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const progress = goals.length
    ? Math.round((completedGoals / goals.length) * 100)
    : 0;

  const addGoal = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!title.trim() || saving) return;

    setError("");
    setSaving(true);

    try {
      const newGoal = await createGoal(title.trim());

      setGoals((previous) => [newGoal, ...previous]);
      setTitle("");
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = async (goal: Goal) => {
    if (busyIds.includes(goal._id)) return;

    setError("");
    setBusyIds((previous) => [...previous, goal._id]);

    try {
      const updatedGoal = await updateGoal(
        goal._id,
        !goal.completed
      );

      setGoals((previous) =>
        previous.map((item) =>
          item._id === goal._id ? updatedGoal : item
        )
      );
    } catch (error) {
      handleError(error);
    } finally {
      setBusyIds((previous) =>
        previous.filter((id) => id !== goal._id)
      );
    }
  };

  const removeGoal = async (id: string) => {
    if (busyIds.includes(id)) return;

    setError("");
    setBusyIds((previous) => [...previous, id]);

    try {
      await deleteGoal(id);

      setGoals((previous) =>
        previous.filter((goal) => goal._id !== id)
      );
    } catch (error) {
      handleError(error);
    } finally {
      setBusyIds((previous) =>
        previous.filter((item) => item !== id)
      );
    }
  };

  return (
    <main className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Your personal workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Stay focused, manage your daily goals and track your progress.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {/* Dashboard container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-600/10">

          {/* Dark header from preview */}
          <div className="bg-slate-900 px-5 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              FOCUS Dashboard
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Welcome back!
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              Small steps today. Big results tomorrow.
            </p>
          </div>

          <div className="space-y-8 p-4 sm:p-6 lg:p-8">

            {/* Coloured statistics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Total Goals
                  </p>
                  <span className="text-xl text-blue-600">
                    ◎
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-blue-600">
                  {goals.length}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Goals you've created
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Completed Goals
                  </p>
                  <span className="text-xl text-emerald-600">
                    ✓
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-emerald-600">
                  {completedGoals}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Goals achieved
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Goal Progress
                  </p>
                  <span className="text-xl text-orange-600">
                    ↗
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-orange-600">
                  {progress}%
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Overall completion rate
                </p>
              </div>
            </div>

            {/* Today's Focus */}
            <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Today's Focus
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your goals and activities
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {completedGoals} of {goals.length} done
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                  <span>Goal progress</span>
                  <span>{progress}%</span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Goals progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
{/* Create goal form */}
            <section className="rounded-2xl border border-slate-200 p-5 mt-4 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Create Daily Goal
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                What would you like to achieve today?
              </p>

              <form
                onSubmit={addGoal}
                className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
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
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Practise JavaScript"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Adding..." : "+ Add Goal"}
                </button>
              </form>
            </section>

              {/* Goals list */}
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                    Loading goals...
                  </div>
                ) : goals.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center">
                    <p className="font-medium text-slate-700">
                      No goals created yet.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create your first goal to get started.
                    </p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div
                      key={goal._id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 text-nowrap text-sm"
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          disabled={busyIds.includes(goal._id)}
                          onChange={() => toggleGoal(goal)}
                          className="h-5 w-5 shrink-0 accent-blue-600"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium ${
                              goal.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-800"
                            }`}
                          >
                            {goal.title}
                          </p>
                        </div>
                      </label>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          goal.completed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {goal.completed ? "Completed" : "Pending"}
                      </span>

                      <button
                        type="button"
                        disabled={busyIds.includes(goal._id)}
                        onClick={() => removeGoal(goal._id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500">
                  Recurring goals and reminders coming soon
                </p>

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
