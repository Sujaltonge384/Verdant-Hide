// client/src/app/not-found.tsx
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#5A6344]">404</span>
        <h1 className="mt-3 text-4xl sm:text-6xl font-black">Page Not Found</h1>
        <p className="mt-4 max-w-md text-sm text-neutral-600">
          The piece or page you’re looking for may have moved. Explore our plant-based leather collection instead.
        </p>
        <Link
          href="/collection"
          className="mt-8 rounded-full bg-[#16171A] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white"
        >
          Back to Collection
        </Link>
      </main>
      <Footer />
    </div>
  );
}