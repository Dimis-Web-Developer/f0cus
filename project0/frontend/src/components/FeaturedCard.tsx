
type FeaturedCardProps = {
  title: string;
  description: string;
  icon: string;
};

function FeaturedCard({
  title,
  description,
  icon,
}: FeaturedCardProps) {
  return (
    <article
      className="
        group flex h-full w-full flex-col
        rounded-2xl border border-slate-200
        bg-white p-6
        shadow-sm
        transition-all duration-300 ease-in-out
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-lg hover:shadow-slate-200/70
        sm:p-7
      "
    >
      <div className="mb-4 flex items-center gap-4">
        {/* Feature icon */}
        <div
          className="
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-xl bg-blue-50
            text-2xl
            transition-colors duration-300
            group-hover:bg-blue-100
          "
        >
          <span aria-hidden="true">{icon}</span>
        </div>

        {/* Feature title */}
        <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h3>
      </div>

      {/* Feature description */}
      <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
        {description}
      </p>
    </article>
  );
}

export default FeaturedCard;
