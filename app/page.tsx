import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import QueryCarousel from '@/components/landing/QueryCarousel';
import TechStack from '@/components/landing/TechStack';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Hero />
      <HowItWorks />
      <QueryCarousel />
      <TechStack />
    </main>
  );
}
