// client/src/components/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';


export default function Footer() {

    const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#121315] text-[#F5F2EB] pt-20 pb-10 px-6 md:px-12 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 pb-16 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F2EB] text-[#16171A]">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold tracking-wider uppercase">
                Verdant Hide
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
              Architectural carry goods crafted with plant-derived bio-leather exteriors (cactus, apple, pineapple & corn composites) paired with organic cotton linings and brass-finish hardware.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                PETA-Approved Vegan
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                5-Year Warranty
              </span>
            </div>
            <div className="flex flex-wrap gap-5">
               <Link href="/shipping-returns" className="hover:text-white">Shipping &amp; Returns</Link>
               <Link href="/privacy-terms" className="hover:text-white">Privacy &amp; Terms</Link>
               <Link href="/contact" className="hover:text-white">Contact &amp; Grievance</Link>
            </div>
          </div>

          {/* Collection Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Collection
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/collection?category=backpacks" className="hover:text-white transition">
                  Backpacks
                </Link>
              </li>
              <li>
                <Link href="/collection?category=travel-bags" className="hover:text-white transition">
                  Travel &amp; Trunks
                </Link>
              </li>
              <li>
                <Link href="/collection?category=handbags" className="hover:text-white transition">
                  Satchels &amp; Totes
                </Link>
              </li>
              <li>
                <Link href="/collection?category=wallets" className="hover:text-white transition">
                  Wallets &amp; Small Goods
                </Link>
              </li>
            </ul>
          </div>

          {/* House & Materials */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              The House
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/our-story" className="hover:text-white transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/know-leathers" className="hover:text-white transition">
                  K(NO)W Leathers
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-white transition">
                  All Editions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Private Drops &amp; Notes
            </h4>
            <p className="text-sm text-neutral-400">
              Receive early access to small-batch botanical leather releases and care guides.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-4 py-3 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Welcome to Verdant Hide.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 rounded-full bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37] text-[#121315] transition hover:scale-105"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 flex flex-col gap-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Verdant Hide Atelier. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Pan-India Express Shipping</span>
            <span>·</span>
            <span>Cruelty-Free Certified</span>
          </div>
        </div>

        
      </div>
    </footer>
  );
}