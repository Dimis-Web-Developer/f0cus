import Hero from "../components/Hero";
import { features } from "../data/features";
import FeaturedCard from "../components/FeaturedCard";
import HowItWorks from "../components/HowItWorks";
import Preview from "../components/DashBoardReview";

function Home() {
  return (
    <div className="w-full">
      <Hero
        title="Face Open Challenges Until Success Achieved"
        description="Turn your goals into challenges, stay consistent and track your progress."
        buttonText="Get Started"
      />

<section className="flex w-full flex-col justify-center gap-3 py-4 sm:gap-6 sm:py-6 lg:flex-row">
        {features.map((feature) => (
          <FeaturedCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </section> 
       <Preview/>
      <HowItWorks/>
    
    </div>
  );
}

export default Home;