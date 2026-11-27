// client/src/app/collection/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, ShoppingBag, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function CollectionContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [materialFilter, setMaterialFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
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

  const allCategories = CATEGORIES.some((c) => c.id === 'accessories')
    ? CATEGORIES
    : [...CATEGORIES, { id: 'accessories', label: 'Accessories' }];

  const resetFilters = () => {
    setSelectedCat('all');
    setMaterialFilter('all');
    setSortBy('featured');
    setInStockOnly(false);
  };

  const filteredProducts = items
    .filter((p) => (selectedCat === 'all' ? true : p.category === selectedCat))
    .filter((p) =>
      materialFilter === 'all'
        ? true
        : p.material?.toLowerCase().includes(materialFilter.toLowerCase())
    )
    .filter((p) => {
      if (!inStockOnly) return true;
      return p.variants?.length
        ? p.variants.some((v: any) => v.stock > 0)
        : true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  const hasActiveFilters =
    selectedCat !== 'all' || materialFilter !== 'all' || inStockOnly || sortBy !== 'featured';

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 pt-28 pb-20 px-4 sm:px-6 md:px-12">
        {/* Header + Category Pills */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#5A6344]">
              Verdant Hide Atelier
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight md:text-5xl">
              The Collection
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`rounded-full px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
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

        {/* Filter & Sort Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-2xs border border-black/5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
            </span>

            <select
              aria-label="Filter by material"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold outline-none"
            >
              <option value="all">All Materials</option>
              <option value="cactus">Cactus Bio-Leather</option>
              <option value="apple">Apple Bio-Leather</option>
              <option value="pineapple">Pineapple &amp; Cork</option>
              <option value="corn">Corn Bio-Leather</option>
            </select>

            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-bold cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline ml-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-neutral-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Empty State or Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-extrabold">No matching pieces found</h2>
            <p className="text-sm text-neutral-500">
              Try clearing your material or availability filters to view the full collection.
            </p>
            <button
              onClick={resetFilters}
              className="rounded-full bg-[#16171A] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const firstVariant = product.variants?.[0];
              const cardBg = firstVariant?.theme?.bg || product.theme?.bg || '#EFE1D3';
              const cardImg = firstVariant?.imageUrl || product.image;
              const pid = product._id || product.id;
              const hasVariantsStock = product.variants?.length
                ? product.variants.some((v: any) => v.stock > 0)
                : true;

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
                      aria-label="Toggle Wishlist"
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
                    className="my-5 flex h-64 items-center justify-center rounded-2xl p-4 transition"
                  >
                    <img
                      src={cardImg}
                      alt={product.name}
                      className="max-h-52 w-auto object-contain transition-transform duration-300 group-hover:scale-108"
                    />
                  </Link>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6344]">
                      {product.material}
                    </p>
                    <Link href={`/product/${product.slug}`}>
                      <h2 className="text-xl font-bold hover:underline">
                        {product.name}
                      </h2>
                    </Link>

                    {/* Colour Dots */}
                    {product.variants?.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {product.variants.map((v: any, idx: number) => (
                          <span
                            key={v._id || idx}
                            title={v.colorName}
                            style={{ backgroundColor: v.colorHex }}
                            className="h-3.5 w-3.5 rounded-full border border-black/15"
                          />
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-lg font-black">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        disabled={!hasVariantsStock}
                        onClick={() => addToCart(product, firstVariant)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#16171A] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-40"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {hasVariantsStock ? 'Add' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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