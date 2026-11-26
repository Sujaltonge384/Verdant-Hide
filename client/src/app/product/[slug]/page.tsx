// client/src/app/product/[slug]/page.tsx
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, Heart, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { PRODUCTS } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';

function ProductDetailContent() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [product, setProduct] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [variantIdx, setVariantIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'warranty'>('specs');
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    apiFetch<{ product: any; similar: any[] }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        setSimilar(res.similar || []);
        setVariantIdx(0);
      })
      .catch(() => {
        // Graceful fallback if Express server isn't running yet
        const localMatch = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
        setProduct({
          ...localMatch,
          _id: localMatch.id,
          reviewCount: 120,
          dimensions: 'Standard Luxury Proportions',
          materialOrigin: 'Certified Plant-Based Bio-Leather',
          careInstructions: 'Wipe gently with a damp soft cotton cloth.',
          variants: [
            {
              _id: `${localMatch.id}-v1`,
              colorName: localMatch.colorName,
              colorHex: localMatch.colorHex,
              imageUrl: localMatch.image,
              stock: 15,
              theme: localMatch.theme,
            },
          ],
        });
        setSimilar(PRODUCTS.filter((p) => p.slug !== slug).slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] pt-36 text-center text-sm font-semibold">
        Loading luxury piece...
      </div>
    );
  }

  const activeVariant = product.variants?.[variantIdx] || product.variants?.[0];
  const productId = product._id || product.id;

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] pt-28 pb-20 px-6 md:px-12">
      <Navbar />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/collection"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
          {/* Dynamic Color Showcase Card */}
          <div
            style={{ backgroundColor: activeVariant.theme.bg }}
            className="lg:sticky lg:top-28 flex h-[430px] md:h-[540px] items-center justify-center rounded-3xl p-8 shadow-xl transition-colors duration-500"
          >
            <img
              src={activeVariant.imageUrl}
              alt={`${product.name} - ${activeVariant.colorName}`}
              className="max-h-[380px] md:max-h-[460px] w-auto object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Interactive Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#E6EBE0] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#3F4D32]">
                {product.material}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {product.rating}/5 ({product.reviewCount})
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {activeVariant.variantTitle || product.name}
            </h1>

            <div className="flex items-center gap-4">
              <p className="text-2xl font-extrabold">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                {activeVariant.stock > 0
                  ? `In Stock (${activeVariant.stock} left)`
                  : 'Out of Stock'}
              </span>
            </div>

            <p className="text-base leading-relaxed text-neutral-600">
              {activeVariant.variantNote || product.description}
            </p>

            {/* Interactive Color Swatches */}
            <div>
              <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Select Color: <span className="text-black">{activeVariant.colorName}</span>
              </p>
              <div className="flex items-center gap-3">
                {product.variants.map((v: any, i: number) => (
                  <button
                    key={v._id || i}
                    onClick={() => setVariantIdx(i)}
                    style={{ backgroundColor: v.colorHex }}
                    className={`h-9 w-9 rounded-full transition-all ${
                      i === variantIdx
                        ? 'ring-2 ring-black ring-offset-2 scale-110'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                disabled={activeVariant.stock === 0}
                onClick={() => addToCart(product, activeVariant)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#16171A] py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Bag
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="flex h-13 w-13 items-center justify-center rounded-full border border-black/20 bg-white"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isInWishlist(productId) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            {/* Interactive Info Tabs */}
            <div className="pt-6 border-t border-black/10">
              <div className="flex gap-6 border-b border-black/10 pb-3 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={
                    activeTab === 'specs'
                      ? 'text-black underline underline-offset-8'
                      : 'text-neutral-400'
                  }
                >
                  Specs & Size
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={
                    activeTab === 'care'
                      ? 'text-black underline underline-offset-8'
                      : 'text-neutral-400'
                  }
                >
                  Material & Care
                </button>
                <button
                  onClick={() => setActiveTab('warranty')}
                  className={
                    activeTab === 'warranty'
                      ? 'text-black underline underline-offset-8'
                      : 'text-neutral-400'
                  }
                >
                  5-Yr Warranty
                </button>
              </div>

              <div className="pt-4 text-sm text-neutral-600">
                {activeTab === 'specs' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-black">
                      Dimensions: {product.dimensions}
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {product.specs?.map((spec: string) => (
                        <div
                          key={spec}
                          className="flex items-center gap-2 rounded-lg bg-white p-2.5 text-xs font-semibold"
                        >
                          <Check className="h-4 w-4 text-[#5A6344]" /> {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div className="space-y-2">
                    <p>
                      <strong>Origin:</strong> {product.materialOrigin}
                    </p>
                    <p>
                      <strong>Care:</strong> {product.careInstructions}
                    </p>
                  </div>
                )}
                {activeTab === 'warranty' && (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-[#5A6344] shrink-0" />
                    <p>
                      Every Verdant Hide piece includes a 5-year hardware & stitching
                      warranty plus free pan-India express shipping.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-6 text-2xl font-black">More Plant-Leather Icons</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {similar.map((item: any) => {
                const v = item.variants?.[0];
                const bg = v?.theme?.bg || item.theme?.bg || '#EFE1D3';
                const img = v?.imageUrl || item.image;
                return (
                  <Link
                    key={item._id || item.id}
                    href={`/product/${item.slug}`}
                    className="rounded-2xl bg-white p-5 shadow-xs hover:shadow-md transition"
                  >
                    <div
                      style={{ backgroundColor: bg }}
                      className="mb-4 flex h-44 items-center justify-center rounded-xl p-4"
                    >
                      <img src={img} alt={item.name} className="max-h-36 object-contain" />
                    </div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-neutral-600">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F4EF] pt-36 text-center text-sm font-semibold">
          Loading luxury piece...
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}