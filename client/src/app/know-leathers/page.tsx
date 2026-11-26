// client/src/app/know-leathers/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LEATHERS = [
  {
    id: 'cactus',
    name: 'Nopal Cactus Leather',
    origin: 'Zacatecas, Mexico',
    waterSaved: '1,200L saved per bag',
    feel: 'Supple, naturally pebbled, breathable matte grain',
    usedIn: 'Cognac Weekender Duffle & Heritage Satchel',
    bg: '#EFE1D3',
  },
  {
    id: 'apple',
    name: 'Apple Skin Bio-Leather',
    origin: 'Bolzano, Northern Italy',
    waterSaved: '85% lower CO₂ vs calfskin',
    feel: 'Structured, water-resistant, sleek semi-gloss finish',
    usedIn: 'Obsidian Flap Backpack & Roll-Top Pack',
    bg: '#E2E8DA',
  },
  {
    id: 'pineapple',
    name: 'Piñatex & Cork Composite',
    origin: 'Philippines & Portugal',
    waterSaved: 'Zero extra farmland required',
    feel: 'Lightweight, high-tensile woven fiber + warm cork trim',
    usedIn: 'Voyager Trunk Trolley',
    bg: '#D7E0EC',
  },
  {
    id: 'corn',
    name: 'Corn Bio-Polyol Leather',
    origin: 'Non-GMO Corn By-Products',
    waterSaved: '100% PVC & solvent free',
    feel: 'Ultra-smooth, abrasion-resistant precision grain',
    usedIn: 'Duo-Tone Bifold Wallet & Passport Sleeve',
    bg: '#F4EFE6',
  },
];

export default function KnowLeathersPage() {
  const [active, setActive] = useState(LEATHERS[0]);

  return (
    <div
      style={{ backgroundColor: active.bg }}
      className="min-h-screen flex flex-col justify-between text-[#16171A] transition-colors duration-500"
    >
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 pt-32 pb-24 px-6 md:px-12">
        <span className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">
          K(NO)W Leathers — Material Science
        </span>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">
          Say No to Animal Hide.
          <br />
          Know What You Carry.
        </h1>

        <div className="mt-10 flex flex-wrap gap-3">
          {LEATHERS.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l)}
              className={`rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider transition ${
                active.id === l.id
                  ? 'bg-[#16171A] text-white'
                  : 'bg-white/70 hover:bg-white'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 rounded-3xl bg-white/85 p-8 md:grid-cols-2 md:p-12 shadow-lg backdrop-blur-sm">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5A6344]">
              Origin: {active.origin}
            </p>
            <h2 className="text-3xl font-black">{active.name}</h2>
            <p className="text-base text-neutral-600">{active.feel}</p>
            <p className="text-sm font-semibold">Featured in: {active.usedIn}</p>
            <Link
              href="/collection"
              className="mt-4 inline-block rounded-full bg-[#16171A] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
            >
              Shop This Material
            </Link>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-[#16171A] p-8 text-[#F5F2EB]">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
              Verified Eco-Impact
            </span>
            <p className="mt-3 text-3xl font-black">{active.waterSaved}</p>
            <p className="mt-4 text-sm text-neutral-300">
              Free from toxic chromium tanning, heavy metals, and fossil-fuel PVC.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}