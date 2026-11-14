
import Hero from "../components/Hero";
import FeaturedCard from "../components/FeaturedCard";
import Preview from "../components/DashBoardReview";
import HowItWorks from "../components/HowItWorks";
import { features } from "../data/features";

function Home() {
  return (
    <main className="w-full">
      {/* Hero section */}
      <Hero
        title="Face Open Challenges Until Success Achieved"
        description="Turn your goals into challenges, stay consistent and track your progress."
        buttonText="Get Started"
      />

      {/* Features section */}
      <section
        aria-label="Focus features"
        className="grid grid-cols-1 gap-5 py-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature) => (
          <FeaturedCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </section>

      {/* Dashboard preview */}
      <section aria-label="Dashboard preview">
        <Preview />
      </section>

      {/* How Focus works */}
      <section aria-label="How Focus works">
        <HowItWorks />
      </section>
    </main>
  );
}

export default Home;
