
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getChallenges,
  createChallenge,
  addChallengeActivity,
  updateChallengeActivity,
  deleteChallengeActivity,
  deleteChallenge,
  type Challenge,
} from "../../services/challengeApi";

const WEEKDAYS = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];

function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Learning");
  const [showForm, setShowForm] = useState(false);

  const [activityTitles, setActivityTitles] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChallenges() {
      try {
        const data = await getChallenges();
        setChallenges(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load challenges"
        );
      } finally {
        setLoading(false);
      }
    }

    loadChallenges();
  }, []);

  function replaceChallenge(updated: Challenge) {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge._id === updated._id
          ? updated
          : challenge
      )
    );
  }

  function getError(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback;
  }

  // CREATE CHALLENGE

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    setError("");
    setSubmitting(true);

    try {
      const challenge = await createChallenge({
        title: title.trim(),
        category,
      });

      setChallenges((prev) => [challenge, ...prev]);
      setTitle("");
      setCategory("Learning");
      setShowForm(false);
    } catch (err) {
      setError(getError(err, "Creation failed"));
    } finally {
      setSubmitting(false);
    }
  }

  // ADD ACTIVITY

  async function handleAddActivity(
    e: FormEvent<HTMLFormElement>,
    challengeId: string
  ) {
    e.preventDefault();

    const activityTitle =
      activityTitles[challengeId]?.trim();

    if (!activityTitle || busyId) return;

    setError("");
    setBusyId(challengeId);

    try {
      const updated = await addChallengeActivity(
        challengeId,
        activityTitle
      );

      replaceChallenge(updated);

      setActivityTitles((prev) => ({
        ...prev,
        [challengeId]: "",
      }));
    } catch (err) {
      setError(getError(err, "Failed to add activity"));
    } finally {
      setBusyId(null);
    }
  }

  // CHECK OR UNCHECK ACTIVITY

  async function handleToggleActivity(
    challengeId: string,
    activityId: string,
    completed: boolean
  ) {
    if (busyId) return;

    setError("");
    setBusyId(challengeId);

    try {
      const updated = await updateChallengeActivity(
        challengeId,
        activityId,
        completed
      );

      replaceChallenge(updated);
    } catch (err) {
      setError(getError(err, "Failed to update activity"));
    } finally {
      setBusyId(null);
    }
  }

  // DELETE ACTIVITY

  async function handleDeleteActivity(
    challengeId: string,
    activityId: string
  ) {
    if (busyId) return;

    setError("");
    setBusyId(challengeId);

    try {
      const updated = await deleteChallengeActivity(
        challengeId,
        activityId
      );

      replaceChallenge(updated);
    } catch (err) {
      setError(getError(err, "Failed to delete activity"));
    } finally {
      setBusyId(null);
    }
  }

  // DELETE CHALLENGE

  async function handleDelete(id: string) {
    if (busyId) return;
    if (!window.confirm("Delete this challenge?")) return;

    setError("");
    setBusyId(id);

    try {
      await deleteChallenge(id);

      setChallenges((prev) =>
        prev.filter((challenge) => challenge._id !== id)
      );
    } catch (err) {
      setError(getError(err, "Delete failed"));
    } finally {
      setBusyId(null);
    }
  }

  // WEEKLY ACTIVITY

  const now = new Date();
  const weekStart = new Date(now);

  const mondayOffset = (now.getDay() + 6) % 7;

  weekStart.setDate(now.getDate() - mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const activeDays = new Set<number>();

  challenges.forEach((challenge) => {
    challenge.activities.forEach((activity) => {
      if (!activity.completed || !activity.completedAt) {
        return;
      }

      const date = new Date(activity.completedAt);

      if (
        !Number.isNaN(date.getTime()) &&
        date >= weekStart &&
        date <= now
      ) {
        activeDays.add((date.getDay() + 6) % 7);
      }
    });
  });

  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === "Completed"
  ).length;

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Your personal workspace
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Challenges
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Build consistency and track your progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Create Challenge"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* CREATE CHALLENGE */}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            New Challenge
          </h2>

          <div>
            <label
              htmlFor="challenge-title"
              className="mb-1 block text-sm font-medium"
            >
              Challenge Title
            </label>

            <input
              id="challenge-title"
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understand mean and variation"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="challenge-category"
              className="mb-1 block text-sm font-medium"
            >
              Category
            </label>

            <select
              id="challenge-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>Learning</option>
              <option>Fitness</option>
              <option>Productivity</option>
              <option>Personal Development</option>
              <option>Other</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            After creating your challenge, add individual
            activities to track your progress.
          </p>

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Challenge"}
          </button>
        </form>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Challenges",
            value: challenges.length,
          },
          {
            label: "In Progress",
            value: challenges.length - completedChallenges,
          },
          {
            label: "Completed",
            value: completedChallenges,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {stat.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* CHALLENGES */}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Your Challenges
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">
              Loading challenges...
            </p>
          ) : challenges.length === 0 ? (
            <p className="text-sm text-gray-500">
              No challenges yet. Create your first challenge.
            </p>
          ) : (
            <div className="space-y-5">
              {challenges.map((challenge) => {
                // Only count activities using the new format.
                const activities = challenge.activities.filter(
                  (activity) =>
                    typeof activity._id === "string" &&
                    typeof activity.title === "string"
                );

                const completed = activities.filter(
                  (activity) => activity.completed
                ).length;

                const total = activities.length;

                const progress =
                  total > 0
                    ? Math.round((completed / total) * 100)
                    : 0;

                const isCompleted =
                  total > 0 && completed === total;

                const isBusy = busyId === challenge._id;

                const hasLegacyActivities =
                  activities.length !== challenge.activities.length;

                return (
                  <div
                    key={challenge._id}
                    className="rounded-lg border border-gray-100 p-4"
                  >

                    {/* CHALLENGE HEADER */}

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {challenge.title}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {challenge.category}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-4 flex justify-between text-sm">
                      <span className="text-gray-500">
                        {completed} of {total} activities
                      </span>

                      <span className="font-medium text-slate-900">
                        {progress}%
                      </span>
                    </div>

                    <div
                      role="progressbar"
                      aria-label={`${challenge.title} progress`}
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted
                            ? "bg-green-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* LEGACY ACTIVITY WARNING */}

                    {hasLegacyActivities && (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                        This challenge contains activities saved
                        using the previous format. Migrate them
                        before editing this challenge.
                      </p>
                    )}

                    {/* ACTIVITY LIST */}

                    <div className="mt-5">
                      <h4 className="mb-3 text-sm font-semibold text-slate-900">
                        Activities
                      </h4>

                      {total === 0 ? (
                        <p className="text-sm text-gray-500">
                          No named activities yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {activities.map((activity) => (
                            <div
                              key={activity._id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                            >
                              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={activity.completed}
                                  disabled={isBusy || !!busyId || hasLegacyActivities}
                                  onChange={(e) =>
                                    handleToggleActivity(
                                      challenge._id,
                                      activity._id,
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 accent-blue-600"
                                />

                                <span
                                  className={`break-words text-sm ${
                                    activity.completed
                                      ? "text-gray-400 line-through"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {activity.title}
                                </span>
                              </label>

                              <button
                                type="button"
                                disabled={!!busyId || hasLegacyActivities}
                                onClick={() =>
                                  handleDeleteActivity(
                                    challenge._id,
                                    activity._id
                                  )
                                }
                                className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ADD ACTIVITY */}

                    <form
                      onSubmit={(e) =>
                        handleAddActivity(e, challenge._id)
                      }
                      className="mt-4 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="text"
                        maxLength={150}
                        value={
                          activityTitles[challenge._id] || ""
                        }
                        disabled={!!busyId || hasLegacyActivities}
                        onChange={(e) =>
                          setActivityTitles((prev) => ({
                            ...prev,
                            [challenge._id]: e.target.value,
                          }))
                        }
                        placeholder="Enter a new activity..."
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                      />

                      <button
                        type="submit"
                        disabled={
                          !!busyId ||
                          hasLegacyActivities ||
                          !activityTitles[challenge._id]?.trim()
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {isBusy ? "Saving..." : "+ Add Activity"}
                      </button>
                    </form>

                    {/* DELETE CHALLENGE */}

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(challenge._id)
                        }
                        disabled={!!busyId}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete Challenge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* WEEKLY ACTIVITY */}

        <section className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Weekly Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Days with at least one completed activity.
          </p>

          <div className="mt-6 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, index) => {
              const active = activeDays.has(index);

              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-gray-500">
                    {day}
                  </span>

                  <div
                    title={
                      active
                        ? "Activity recorded"
                        : "No activity"
                    }
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {active ? "✓" : "·"}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm font-medium text-slate-700">
            {activeDays.size} of 7 days active this week
          </p>
        </section>
      </div>
    </div>
  );
}

export default Challenges;
