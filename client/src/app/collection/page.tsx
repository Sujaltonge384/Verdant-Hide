// client/src/app/collection/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function CollectionContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [items, setItems] = useState<any[]>(PRODUCTS);

  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  useEffect(() => {
    setSelectedCat(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    apiFetch<{ products: any[] }>('/products')
      .then((res) => {
        if (res.products?.length) setItems(res.products);
      })
      .catch(() => {
        // Fallback to local PRODUCTS cleanly
      });
  }, []);

  const filteredProducts =
    selectedCat === 'all'
      ? items
      : items.filter((p) => p.category === selectedCat);

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 pt-28 pb-20 px-6 md:px-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#5A6344]">
              Verdant Hide Atelier
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              The Collection
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  selectedCat === cat.id
                    ? 'bg-[#16171A] text-white'
                    : 'bg-white border border-black/10 hover:bg-black/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const firstVariant = product.variants?.[0];
            const cardBg = firstVariant?.theme?.bg || product.theme?.bg || '#EFE1D3';
            const cardImg = firstVariant?.imageUrl || product.image;
            const pid = product._id || product.id;

            return (
              <div
                key={pid}
                className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-xs transition hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                    {product.categoryLabel}
                  </span>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="rounded-full p-2 hover:bg-neutral-100"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isInWishlist(pid) ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'
                      }`}
                    />
                  </button>
                </div>

                <Link
                  href={`/product/${product.slug}`}
                  style={{ backgroundColor: cardBg }}
                  className="my-6 flex h-64 items-center justify-center rounded-2xl p-4 transition"
                >
                  <img
                    src={cardImg}
                    alt={product.name}
                    className="max-h-52 w-auto object-contain transition-transform duration-300 group-hover:scale-108"
                  />
                </Link>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6344]">
                    {product.material}
                  </p>
                  <Link href={`/product/${product.slug}`}>
                    <h2 className="mt-1 text-xl font-bold hover:underline">
                      {product.name}
                    </h2>
                  </Link>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => addToCart(product, firstVariant)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#16171A] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Loading collection...</div>}>
      <CollectionContent />
    </Suspense>
  );
}