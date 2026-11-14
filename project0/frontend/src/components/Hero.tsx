
import { Link } from "react-router-dom";

type HeroProps = {
  title: string;
  description: string;
  buttonText: string;
};

function Hero({
  title,
  description,
  buttonText,
}: HeroProps) {
  return (
    <section className="mt-3 w-full rounded-2xl bg-slate-900 px-6 py-14 text-center sm:px-10 sm:py-16 lg:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center">

        {/* Badge */}
        <span className="mb-6 inline-flex rounded-full bg-blue-500/15 px-4 py-2 text-xs font-semibold tracking-wider text-blue-300 sm:text-sm">
          YOUR GOALS. YOUR PROGRESS.
        </span>

        {/* Main heading */}
        <h1 className="mb-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {description}
        </p>

        {/* CTA */}
        <Link
          to="/register"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          {buttonText}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default Hero;
