type FeaturedCardProps = {
  title: string;
  description: string;
};

function FeaturedCard({
  title,
  description,
}: FeaturedCardProps) {
  return (
    <div className="w-full md:flex-1 text-center border-gray-200  shadow-md hover: shadow-blue-600 transition  p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-3">
        {title}
      </h2>

      <p className="text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default FeaturedCard;