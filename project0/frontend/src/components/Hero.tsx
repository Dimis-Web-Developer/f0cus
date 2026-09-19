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
    <section className=" min-h-[60vh] md:min-h-[40vh] flex items-center justify-center px-6">
      <div className=" max-w-3xl text-center">
        <h1 className=" text-4xl md:text-6xl font-bold md:mb-4 mb-3 text-slate-700">
          {title}
        </h1>

        <p className="text-lg text-slate-500 mb-8">
          {description}
        </p>

        <button className=" bg-blue-600
    hover:bg-blue-700
    text-white
    px-6
    py-3
    rounded-lg
    transition
    cursor-pointer">
          {buttonText}
        </button>
      </div>
    </section>
  );
}

export default Hero;