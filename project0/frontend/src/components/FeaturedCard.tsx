type FeaturedCardProps = {
  title: string;
  description: string;
  icon: string;
};

function FeaturedCard({ title, description, icon }: FeaturedCardProps) {
  return (
    <article className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition duration-200 hover:-translate-y-1 shadow-blue-600">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          <span aria-hidden="true">{icon}</span>
        </div>

        <h3 className="text-xl font-semibold text-slate-800">
          {title}
        </h3>
      </div>

      <p className="leading-relaxed text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default FeaturedCard;