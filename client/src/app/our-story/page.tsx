// src/app/our-story/page.tsx
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] pt-32 pb-20 px-6 md:px-12">
      <Navbar />
      <div className="mx-auto max-w-4xl space-y-10">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5A6344]">
          Our Story
        </span>
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          Zero Animals. Zero Plastic Leather. Just Pure Botanical Craft.
        </h1>
        <p className="text-lg leading-relaxed text-neutral-600">
          Traditional vegan leather is made from PVC or polyurethane plastic. At
          Verdant Hide, we partner with circular farms to turn prickly pear
          cactus, discarded apple pomace, pineapple leaf fibers, and corn
          by-products into breathable, ultra-durable luxury carry goods.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-4">
          <div className="rounded-2xl bg-white p-6 shadow-xs">
            <h3 className="text-3xl font-black text-[#5A6344]">85%</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Lower carbon footprint compared to conventional animal tanning.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-xs">
            <h3 className="text-3xl font-black text-[#5A6344]">100%</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Cruelty-free & free from toxic heavy metals or PVC coatings.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-xs">
            <h3 className="text-3xl font-black text-[#5A6344]">5+ Yrs</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Abrasion-tested hardware and plant-waxed bio-leather finish.
            </p>
          </div>
        </div>
        <div>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-[#16171A] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}