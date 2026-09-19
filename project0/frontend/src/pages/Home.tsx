import Hero from "../components/Hero"
import {features} from "../data/features"
import FeaturedCard from "../components/FeaturedCard"

function Home() {
  return (
  <main className="md:ml-40 md:pt-12 md:pb-14">
      <Hero title="Face Open Challenges Until Success Achieved"
        description="Turn your goals into challenges, stay consistent and track your progress." buttonText = "Get Started"/>
       <section className=" w-full  flex flex-col md:flex-row justify-center gap-6 p-6">
        {features.map((feature) => (
          <FeaturedCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </main>
    
  )
}

export default Home