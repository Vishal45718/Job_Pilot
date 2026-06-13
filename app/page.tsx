import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/homepage/Hero";
import { Features } from "@/components/homepage/Features";
import { Testimonial } from "@/components/homepage/Testimonial";
import { BottomCTA } from "@/components/homepage/BottomCTA";
import { Footer } from "@/components/layout/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function Home() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar user={data?.user} />
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        <Features />
        <Testimonial />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}