// client/src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, User, Leaf, Search, Menu, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/products';

interface NavbarProps {
  transparentMode?: boolean;
  isDarkTheme?: boolean;
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function Navbar({
  transparentMode = false,
  isDarkTheme = false,
}: NavbarProps) {
  const {
    user,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsProfileOpen,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const textColor = transparentMode
    ? isDarkTheme
      ? 'text-[#F5F2EB]'
      : 'text-[#16171A]'
    : 'text-[#16171A]';

  const initials = getInitials(user?.name);
  const searchResults = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.material.toLowerCase().includes(query.toLowerCase()) ||
          p.categoryLabel.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-3 py-3 sm:px-6 sm:py-4 md:px-10 transition-all duration-500"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-500 ${
            transparentMode
              ? 'bg-transparent border border-transparent shadow-none'
              : 'bg-white/85 backdrop-blur-md border border-black/10 shadow-sm'
          } ${textColor}`}
        >
          {/* Left: Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-colors duration-300 ${
                  transparentMode && isDarkTheme
                    ? 'bg-[#F5F2EB] text-[#16171A]'
                    : 'bg-[#16171A] text-[#F5F2EB]'
                }`}
              >
                <Leaf className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </div>
              <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-wider uppercase">
                Verdant Hide
              </span>
            </Link>
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em]">
            <Link href="/collection" className="hover:opacity-65 transition">
              Collection
            </Link>
            <Link href="/our-story" className="hover:opacity-65 transition">
              Our Story
            </Link>
            <Link href="/know-leathers" className="hover:opacity-65 transition">
              K(NO)W Leathers
            </Link>
          </nav>

          {/* Right: Search, Wishlist, Bag, Profile / Initials Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              onClick={() => setIsWishlistOpen(true)}
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#16171A]">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <Link
                href="/profile"
                aria-label="My Profile"
                title={user.name}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-[#16171A] text-xs font-black tracking-wider shadow-xs ring-2 ring-current/20 hover:scale-105 transition"
              >
                {initials}
              </Link>
            ) : (
              <button
                onClick={() => setIsProfileOpen(true)}
                aria-label="Sign In"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 transition"
              >
                <User className="h-[18px] w-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-2 mx-auto max-w-7xl rounded-3xl bg-white/95 backdrop-blur-lg p-6 text-[#16171A] shadow-xl md:hidden border border-black/10"
            >
              <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                <Link href="/collection" onClick={() => setMobileMenuOpen(false)}>
                  Collection
                </Link>
                <Link href="/our-story" onClick={() => setMobileMenuOpen(false)}>
                  Our Story
                </Link>
                <Link href="/know-leathers" onClick={() => setMobileMenuOpen(false)}>
                  K(NO)W Leathers
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  {user ? `Profile (${initials})` : 'Account / Sign In'}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 text-[#16171A] shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-black/10 pb-3">
                <Search className="h-5 w-5 text-neutral-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search backpacks, cactus leather, wallets..."
                  className="flex-1 text-sm outline-none"
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
                {query.trim() && searchResults.length === 0 && (
                  <p className="py-6 text-center text-xs text-neutral-500">
                    No matching products found.
                  </p>
                )}
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-4 rounded-xl p-2.5 hover:bg-[#F6F4EF] transition"
                  >
                    <img src={p.image} alt={p.name} className="h-12 w-12 object-contain" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.material}</p>
                    </div>
                    <span className="text-xs font-black">₹{p.price.toLocaleString('en-IN')}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}