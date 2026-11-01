
const steps = [
  {
    number: "01",
    title: "Create Your Goal",
    description:
      "Set a personal goal, break it into manageable tasks and choose when to work on it.",
    icon: "🎯",
  },
  {
    number: "02",
    title: "Automate Your Routine",
    description:
      "Schedule recurring tasks and reminders to help you stay focused and consistent.",
    icon: "⚡",
  },
  {
    number: "03",
    title: "Track Your Progress",
    description:
      "Complete daily tasks, monitor your progress and celebrate every achievement.",
    icon: "📈",
  },
];

function HowItWorks() {
  return (
    <section className="w-full px-2 pt-8 pb-16 sm:pt-12 sm:pb-20">
      <div className="mx-auto max-w-6xl">

        {/* Section heading */}
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Three simple steps
          </span>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How FOCUS Works
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Turn your goals into daily actions, build
            consistency and achieve meaningful progress.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">

          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/10"
            >
              {/* Step number */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold tracking-widest text-blue-600">
                  STEP {step.number}
                </span>

                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl"
                  aria-hidden="true"
                >
                  {step.icon}
                </span>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {step.title}
              </h3>

              <p className="text-sm leading-7 text-slate-500">
                {step.description}
              </p>

              {/* Bottom accent */}
              <div className="mt-8 h-1 w-12 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-20" />
            </div>
          ))}
        </div>

        {/* Supporting message */}
        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            Less time organising. More time achieving.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
