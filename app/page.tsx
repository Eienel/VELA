import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import QueryCarousel from '@/components/landing/QueryCarousel';
import TechStack from '@/components/landing/TechStack';

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Hero />
      <HowItWorks />
      <QueryCarousel />
      <TechStack />
    </main>
  );
}
