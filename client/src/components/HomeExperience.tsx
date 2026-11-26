// client/src/components/HomeExperience.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence,Variants } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  Heart,
  Star,
  ArrowDown,
  Leaf,
  Droplets,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Navbar from './Navbar';
import Preloader from './Preloader';
import Footer from './Footer';

// Diagonal Arc Transition matching reference video
const arcVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    y: direction > 0 ? -280 : 320,
    rotate: direction > 0 ? 18 : -18,
    scale: 0.72,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    rotate: -3,
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 105,
      damping: 18,
      mass: 0.9,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -400 : 400,
    y: direction > 0 ? 320 : -280,
    rotate: direction > 0 ? -20 : 20,
    scale: 0.72,
    opacity: 0,
    transition: {
      duration: 0.45,
      ease: [0.32, 0.72, 0, 1] as const,
    },
  }),
};

// Instant fallback data with 3 color variants each so snap-scroll works immediately
const buildLocalShowcase = () =>
  PRODUCTS.slice(0, 5).map((p) => ({
    ...p,
    _id: p.id,
    reviewCount: 240,
    variants: [
      {
        _id: `${p.id}-v1`,
        colorName: p.colorName,
        variantTitle: p.name,
        variantNote: p.description,
        colorHex: p.colorHex,
        imageUrl: p.image,
        stock: 15,
        theme: p.theme,
      },
      {
        _id: `${p.id}-v2`,
        colorName: 'Sage Moss',
        variantTitle: `${p.name} — Sage`,
        variantNote: 'Botanical olive-sage plant leather edition.',
        colorHex: '#556347',
        imageUrl: p.image,
        stock: 12,
        theme: {
          bg: '#E2E8DA',
          text: '#1F2918',
          mutedText: '#4F5E45',
          accent: '#3F5230',
          buttonBg: '#1F2918',
          buttonText: '#E2E8DA',
          isDark: false,
        },
      },
      {
        _id: `${p.id}-v3`,
        colorName: 'Bordeaux Wine',
        variantTitle: `${p.name} — Bordeaux`,
        variantNote: 'Deep fermented-grape burgundy bio-leather.',
        colorHex: '#63262E',
        imageUrl: p.image,
        stock: 8,
        theme: {
          bg: '#321419',
          text: '#F8ECEE',
          mutedText: '#CEAEB3',
          accent: '#E3A1AB',
          buttonBg: '#F8ECEE',
          buttonText: '#321419',
          isDark: true,
        },
      },
    ],
  }));

export default function HomeExperience() {
  const [loadingDone, setLoadingDone] = useState(false);
  const [products, setProducts] = useState<any[]>(buildLocalShowcase);
  // stage: -1 = Welcome Hero, 0..4 = 5 Showcase Products, 5 = Brand Sections + Footer
  const [stage, setStage] = useState<number>(-1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const lastScrollTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const extraSectionRef = useRef<HTMLDivElement>(null);

  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  // Sync live MongoDB showcase products when Express is running
  useEffect(() => {
    apiFetch<{ products: any[] }>('/products?showcase=true')
      .then((res) => {
        if (res.products?.length) {
          setProducts(res.products);
        }
      })
      .catch(() => {
        // Keeps buildLocalShowcase silently
      });
  }, []);

  const isShowcaseActive = stage >= 0 && stage < products.length;
  const isFooterSection = stage === products.length;

  const activeProduct = isShowcaseActive ? products[stage] : null;
  const activeVariant =
    activeProduct?.variants?.[selectedVariantIdx] || activeProduct?.variants?.[0];

  const activeBg = isShowcaseActive
    ? activeVariant?.theme?.bg || '#16171A'
    : '#F6F4EF';
  const activeText = isShowcaseActive
    ? activeVariant?.theme?.text || '#F5F2EB'
    : '#16171A';

  const navigateStage = useCallback(
    (delta: number) => {
      setStage((prev) => {
        const next = prev + delta;
        // Max stage is products.length (the expanded brand sections + footer)
        if (next < -1 || next > products.length) return prev;
        setDirection(delta);
        setSelectedVariantIdx(0);
        return next;
      });
    },
    [products.length]
  );

  // Snap-Scroll Mouse Wheel Control from the start of the homepage
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!loadingDone) {
        e.preventDefault();
        return;
      }

      // If on the bottom Editorial + Footer view, allow normal vertical scrolling
      // unless scrolling UP at the very top (scrollTop <= 2) to return to Product 5
      if (stage === products.length) {
        const scrollTop = extraSectionRef.current?.scrollTop ?? 0;
        if (e.deltaY < 0 && scrollTop <= 2) {
          e.preventDefault();
          const now = Date.now();
          if (now - lastScrollTime.current < 700) return;
          lastScrollTime.current = now;
          navigateStage(-1);
        }
        return;
      }

      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 700) return;

      if (Math.abs(e.deltaY) > 18) {
        lastScrollTime.current = now;
        navigateStage(e.deltaY > 0 ? 1 : -1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [loadingDone, stage, products.length, navigateStage]);

  // Keyboard Arrow Support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!loadingDone) return;
      if (stage === products.length) {
        const scrollTop = extraSectionRef.current?.scrollTop ?? 0;
        if (e.key === 'ArrowUp' && scrollTop <= 2) {
          navigateStage(-1);
        }
        return;
      }
      if (e.key === 'ArrowDown') navigateStage(1);
      if (e.key === 'ArrowUp') navigateStage(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [loadingDone, stage, products.length, navigateStage]);

  return (
    <>
      {!loadingDone && <Preloader onComplete={() => setLoadingDone(true)} />}

      <motion.main
        animate={{ backgroundColor: activeBg, color: activeText }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        onTouchStart={(e) => (touchStartY.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          const diff = touchStartY.current - e.changedTouches[0].clientY;
          if (stage === products.length) {
            const scrollTop = extraSectionRef.current?.scrollTop ?? 0;
            if (diff < -45 && scrollTop <= 2) navigateStage(-1);
            return;
          }
          if (Math.abs(diff) > 45) navigateStage(diff > 0 ? 1 : -1);
        }}
       className="relative h-[100dvh] w-full overflow-hidden select-none"
      >
        {/* Dual-State Navbar: Resting at Intro/Footer, Transparent during Product Showcase */}
        <Navbar
          transparentMode={isShowcaseActive}
          isDarkTheme={activeVariant?.theme?.isDark ?? false}
        />

        <AnimatePresence mode="wait">
          {/* STAGE -1: WELCOME MESSAGE HERO */}
          {stage === -1 && (
            <motion.section
              key="intro-hero"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.55 }}
              className="flex h-full flex-col items-center justify-center px-6 text-center"
            >
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#3F4D32]">
                Cactus · Apple · Pineapple Leather
              </span>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                Luxury Grown From Earth.
                <br />
                <span className="italic font-serif font-normal text-[#6B543E]">
                  Crafted to Outlast.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                100% cruelty-free, plant-based leather backpacks, travel trunks,
                satchels, and everyday carry designed for modern movement.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => navigateStage(1)}
                  className="inline-flex items-center gap-3 rounded-full bg-[#16171A] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:scale-105"
                >
                  Scroll Collection <ArrowDown className="h-4 w-4 animate-bounce" />
                </button>
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-2 rounded-full border border-black/20 px-8 py-4 text-xs font-bold uppercase tracking-widest transition hover:bg-black/5"
                >
                  Open Collection
                </Link>
              </div>
            </motion.section>
          )}

          {/* STAGE 0..4: PRODUCT ARC SHOWCASE WITH COLOR SWATCHES */}
          {isShowcaseActive && activeProduct && activeVariant && (
            <motion.section
              key="product-showcase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto flex h-full max-w-7xl flex-col justify-between px-4 pt-20 pb-5 sm:px-6 md:px-12 md:pt-24 md:pb-8"
            >
              <div className="grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-12">
                {/* Left Column: Dynamic Product + Variant Details */}
                <div className="lg:col-span-5 z-20">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeProduct._id}-${activeVariant._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <span
                        style={{
                          borderColor: activeVariant.theme.accent,
                          color: activeVariant.theme.accent,
                        }}
                        className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest"
                      >
                        {activeProduct.material}
                      </span>

                      <h2 className="text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                        {activeVariant.variantTitle || activeProduct.name}
                      </h2>

                      <p
                        style={{ color: activeVariant.theme.mutedText }}
                        className="max-w-md text-sm leading-relaxed md:text-base"
                      >
                        {activeVariant.variantNote || activeProduct.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => addToCart(activeProduct, activeVariant)}
                          style={{
                            backgroundColor: activeVariant.theme.buttonBg,
                            color: activeVariant.theme.buttonText,
                          }}
                          className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition hover:scale-105 active:scale-95"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Add to Bag — ₹{activeProduct.price.toLocaleString('en-IN')}
                        </button>

                        <button
                          onClick={() => toggleWishlist(activeProduct)}
                          aria-label="Toggle Wishlist"
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-current/25 transition hover:scale-105"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isInWishlist(activeProduct._id)
                                ? 'fill-rose-500 text-rose-500'
                                : ''
                            }`}
                          />
                        </button>
                      </div>

                      <div className="pt-2 flex items-center gap-6">
                        <Link
                          href={`/collection?category=${activeProduct.category}`}
                          style={{ color: activeVariant.theme.accent }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                          Explore More {activeProduct.categoryLabel}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <Link
                          href={`/product/${activeProduct.slug}`}
                          className="text-xs font-semibold underline-offset-4 hover:underline opacity-75"
                        >
                          View Full Specs
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Center Column: Floating Arc Product Image */}
                <div className="relative lg:col-span-6 flex h-[190px] sm:h-[320px] md:h-[460px] items-center justify-center">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={`${activeProduct._id}-${activeVariant._id}`}
                      custom={direction}
                      variants={arcVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute flex items-center justify-center"
                    >
                      <Link href={`/product/${activeProduct.slug}`}>
                        <img
                          src={activeVariant.imageUrl}
                          alt={activeVariant.colorName}
                          draggable={false}
                          className="max-h-[260px] sm:max-h-[360px] md:max-h-[460px] w-auto cursor-pointer object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-105"
                        />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right Column: Up/Down Navigation Controls */}
                <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-3 z-20">
                  <button
                    onClick={() => navigateStage(-1)}
                    aria-label="Previous"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 backdrop-blur-sm transition hover:scale-110"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>

                  <span className="text-xs font-mono opacity-75">
                    0{stage + 1}/0{products.length}
                  </span>

                  <button
                    onClick={() => navigateStage(1)}
                    aria-label="Next"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 backdrop-blur-sm transition hover:scale-110"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Bottom Bar: Interactive 2–4 Color Swatches & Rating */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-t border-current/10 pt-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                    Colors — <span className="opacity-100">{activeVariant.colorName}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    {activeProduct.variants.map((variant: any, idx: number) => (
                      <button
                        key={variant._id || idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        aria-label={`Select color ${variant.colorName}`}
                        style={{ backgroundColor: variant.colorHex }}
                        className={`h-8 w-8 rounded-full transition-all duration-300 ${
                          idx === selectedVariantIdx
                            ? 'ring-2 ring-current ring-offset-2 ring-offset-transparent scale-115'
                            : 'opacity-75 hover:opacity-100 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>
                    {activeProduct.rating}/5 ({activeProduct.reviewCount} Reviews)
                  </span>
                  {stage === products.length - 1 && (
                    <button
                      onClick={() => navigateStage(1)}
                      className="ml-3 rounded-full border border-current/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-current/10"
                    >
                      Continue ↓
                    </button>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* STAGE 5: EXPANDED EDITORIAL SECTIONS + BRAND FOOTER */}
          {isFooterSection && (
            <motion.div
              ref={extraSectionRef}
              key="brand-sections"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full overflow-y-auto select-text"
            >
              {/* Curated Categories */}
              <section className="mx-auto max-w-7xl px-6 pt-28 pb-20 md:px-12">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <button
                      onClick={() => navigateStage(-1)}
                      className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
                    >
                      <ChevronUp className="h-4 w-4" /> Back to Showcase
                    </button>
                    <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                      Curated by Silhouette
                    </h2>
                  </div>
                  <Link
                    href="/collection"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    View Entire Collection <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: 'Backpacks', slug: 'backpacks', img: '/images/backpack.png', bg: '#16171A', dark: true },
                    { title: 'Travel Trunks', slug: 'travel-bags', img: '/images/suitcase.png', bg: '#D7E0EC', dark: false },
                    { title: 'Satchels & Totes', slug: 'handbags', img: '/images/briefcase.png', bg: '#EFE1D3', dark: false },
                    { title: 'Wallets & Carry', slug: 'wallets', img: '/images/wallet.png', bg: '#162133', dark: true },
                  ].map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/collection?category=${cat.slug}`}
                      style={{ backgroundColor: cat.bg }}
                      className={`group flex h-80 flex-col justify-between rounded-3xl p-6 transition hover:-translate-y-1.5 hover:shadow-xl ${
                        cat.dark ? 'text-[#F5F2EB]' : 'text-[#16171A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold">{cat.title}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        <img
                          src={cat.img}
                          alt={cat.title}
                          className="max-h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-108"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* K(NO)W Leathers Impact Strip */}
              <section className="bg-[#EAE5DC] py-20 px-6 md:px-12">
                <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                  <div className="space-y-6">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5A6344]">
                      K(NO)W Leathers
                    </span>
                    <h2 className="text-3xl font-black leading-tight md:text-5xl">
                      Real Leather Feel.
                      <br />
                      Zero Animal Harm. Zero PVC.
                    </h2>
                    <p className="text-base leading-relaxed text-neutral-700">
                      Most &ldquo;vegan&rdquo; bags are fossil-fuel plastic. We partner
                      with regenerative farms to transform cactus, apple pomace,
                      pineapple fibers, and cork into heirloom-grade carry.
                    </p>
                    <Link
                      href="/know-leathers"
                      className="inline-flex items-center gap-2 rounded-full bg-[#16171A] px-7 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
                    >
                      Explore Our Bio-Materials <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-xs">
                      <Droplets className="h-6 w-6 text-[#5A6344] mb-4" />
                      <p className="text-2xl font-black">1,200L</p>
                      <p className="mt-1 text-xs text-neutral-500">Water saved per travel bag</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-xs">
                      <Leaf className="h-6 w-6 text-[#5A6344] mb-4" />
                      <p className="text-2xl font-black">85%</p>
                      <p className="mt-1 text-xs text-neutral-500">Lower CO₂ vs animal hide</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-xs">
                      <ShieldCheck className="h-6 w-6 text-[#5A6344] mb-4" />
                      <p className="text-2xl font-black">5 Yrs</p>
                      <p className="mt-1 text-xs text-neutral-500">Hardware &amp; leather warranty</p>
                    </div>
                  </div>
                </div>
              </section>

              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </>
  );
}