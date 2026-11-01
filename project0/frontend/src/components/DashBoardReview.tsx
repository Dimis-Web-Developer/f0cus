
import { useState } from "react";

type Stat = {
  title: string;
  value: string;
  detail: string;
  color: string;
  accent: string;
  icon: string;
};

type Challenge = {
  title: string;
  category: string;
  progress: number;
};

type DailyGoal = {
  id: number;
  title: string;
  time: string;
  completed: boolean;
};

const sampleStats: Stat[] = [
  {
    title: "Active Challenges",
    value: "3",
    detail: "Challenges in progress",
    color: "bg-blue-50",
    accent: "text-blue-600",
    icon: "◎",
  },
  {
    title: "Completed Goals",
    value: "12",
    detail: "Goals achieved",
    color: "bg-emerald-50",
    accent: "text-emerald-600",
    icon: "✓",
  },
  {
    title: "Current Streak",
    value: "7 days",
    detail: "Keep the momentum going",
    color: "bg-orange-50",
    accent: "text-orange-600",
    icon: "🔥",
  },
];

const challenges: Challenge[] = [
  {
    title: "Complete My Portfolio",
    category: "Career",
    progress: 70,
  },
  {
    title: "Exercise 3 Times a Week",
    category: "Health & Fitness",
    progress: 45,
  },
];

const weeklyActivity = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: true },
  { day: "Fri", completed: false },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

const initialGoals: DailyGoal[] = [
  {
    id: 1,
    title: "Practise JavaScript",
    time: "09:00",
    completed: true,
  },
  {
    id: 2,
    title: "Work on FOCUS App",
    time: "11:00",
    completed: false,
  },
  {
    id: 3,
    title: "Exercise for 30 minutes",
    time: "18:00",
    completed: false,
  },
];

function DashboardPreview() {
  const [dailyGoals, setDailyGoals] =
    useState<DailyGoal[]>(initialGoals);

  const completedGoals = dailyGoals.filter(
    (goal) => goal.completed
  ).length;

  const completionRate = dailyGoals.length
    ? Math.round(
        (completedGoals / dailyGoals.length) * 100
      )
    : 0;

  const toggleGoal = (id: number) => {
    setDailyGoals((previous) =>
      previous.map((goal) =>
        goal.id === id
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  };

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">

        {/* Section heading */}
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Your personal dashboard
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your Progress at a Glance
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Stay organised, complete daily goals and build
            consistent habits.
          </p>
        </div>

        {/* Main dashboard preview */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-600/10">

          {/* Header */}
          <div className="bg-slate-900 px-5 py-7 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                  FOCUS Dashboard
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  Welcome back!
                </h3>

                <p className="mt-1 text-sm text-slate-300">
                  Small steps today. Big results tomorrow.
                </p>
              </div>

              <span className="rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-200">
                Interactive preview
              </span>
            </div>
          </div>

          <div className="space-y-8 p-4 sm:p-6 lg:p-8">

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {sampleStats.map((stat) => (
                <div
                  key={stat.title}
                  className={`rounded-2xl p-5 ${stat.color}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-700">
                      {stat.title}
                    </p>

                    <span
                      className={`text-xl ${stat.accent}`}
                      aria-hidden="true"
                    >
                      {stat.icon}
                    </span>
                  </div>

                  <p className={`mt-4 text-3xl font-bold ${stat.accent}`}>
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Daily goals */}
            <div className="rounded-2xl border border-slate-200 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Today's Focus
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Your daily goals and activities
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {completedGoals} of {dailyGoals.length} done
                </span>
              </div>

              {/* Completion progress */}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                  <span>Daily progress</span>
                  <span>{completionRate}%</span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Daily goals progress"
                  aria-valuenow={completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Daily task list */}
              <div className="mt-5 space-y-3">
                {dailyGoals.map((goal) => (
                  <label
                    key={goal.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      disabled 
                      onChange={() => toggleGoal(goal.id)}
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

                      <p className="mt-1 text-xs text-slate-500">
                        Scheduled for {goal.time}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        goal.completed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {goal.completed ? "Completed" : "Pending"}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span aria-hidden="true">↻</span>
                  <span>Recurring goals and reminders coming soon</span>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  Automation Preview
                </span>
              </div>
            </div>

            {/* Challenges and weekly activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Challenges */}
              <div className="min-w-0 lg:col-span-2">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Active Challenges
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    See how close you are to your goals.
                  </p>
                </div>

                <div className="space-y-3">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.title}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h5 className="font-semibold text-slate-800">
                            {challenge.title}
                          </h5>

                          <p className="mt-1 text-xs text-slate-500">
                            {challenge.category}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-blue-600">
                          {challenge.progress}%
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${challenge.title} progress`}
                        aria-valuenow={challenge.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${challenge.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly activity */}
              <div className="rounded-2xl bg-slate-50 p-5">
                <h4 className="text-lg font-bold text-slate-900">
                  Weekly Activity
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Your consistency this week
                </p>

                <div className="mt-6 grid grid-cols-7 gap-1">
                  {weeklyActivity.map((activity) => (
                    <div
                      key={activity.day}
                      className="flex flex-col items-center gap-2"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 ${
                          activity.completed
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                        aria-label={`${activity.day}: ${
                          activity.completed
                            ? "completed"
                            : "not completed"
                        }`}
                      >
                        {activity.completed ? "✓" : "–"}
                      </span>

                      <span className="text-[10px] text-slate-500 sm:text-xs">
                        {activity.day}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-800">
                    4 of 7 days completed
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Small actions build lasting habits.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;
