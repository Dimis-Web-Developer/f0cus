
type Step = {
  number: string;
  title: string;
  description: string;
  icon: string;
};

const steps: Step[] = [
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
    <section className="w-full px-2 pb-16 pt-8 sm:pb-20 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-10 text-center sm:mb-12">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="
                group flex h-full flex-col
                rounded-2xl border border-slate-200
                bg-white p-6
                shadow-sm
                transition-all duration-300 ease-in-out
                hover:-translate-y-1
                hover:border-blue-200
                hover:shadow-md
                sm:p-7
              "
            >
              {/* Step number and icon */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold tracking-widest text-blue-600">
                  STEP {step.number}
                </span>

                <span
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-xl bg-blue-50
                    text-2xl
                    transition-colors duration-300
                    group-hover:bg-blue-100
                  "
                  aria-hidden="true"
                >
                  {step.icon}
                </span>
              </div>

              {/* Step title */}
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {step.title}
              </h3>

              {/* Step description */}
              <p className="text-sm leading-7 text-slate-600">
                {step.description}
              </p>

              {/* Bottom accent */}
              <div className="mt-auto pt-8">
                <div
                  className="
                    h-1 w-12 rounded-full
                    bg-blue-600
                    transition-all duration-300
                    group-hover:w-20
                  "
                />
              </div>
            </article>
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
