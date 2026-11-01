import { Link } from "react-router-dom";

type HeroProps = {
  title: string;
  description: string;
  buttonText: string;
};

function Hero({ title, description, buttonText }: HeroProps) {
  return (
    <section className="rounded-2xl  bg-slate-900 px-5 py-12 text-center sm:px-8 sm:py-16 lg:mt-3 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <span className="mb-5 inline-block rounded-full bg-blue-500/15 px-4 py-2 text-xs font-semibold tracking-wider text-blue-300">
          YOUR GOALS. YOUR PROGRESS.
        </span>

        <h1 className="mb-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {description}
        </p>

        <Link
          to="/register"
          className="inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          {buttonText} →
        </Link>
      </div>
    </section>
  );
}

export default Hero;