// client/src/components/Drawers.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Package,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function Drawers() {
  const router = useRouter();
  const {
    user,
    cart,
    wishlist,
    isCartOpen,
    isWishlistOpen,
    isProfileOpen,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsProfileOpen,
    login,
    register,
    logout,
    updateQty,
    removeFromCart,
    addToCart,
    toggleWishlist,
    cartTotal,
  } = useStore();

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authTab === 'register' && password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (authTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#F9F8F5] text-[#16171A] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <ShoppingBag className="h-5 w-5" /> Your Bag
                </h3>
                <button onClick={() => setIsCartOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.length === 0 ? (
                  <p className="mt-20 text-center text-sm text-neutral-500">
                    Your bag is empty. Explore the collection to add plant-leather pieces.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-xs"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-contain rounded-lg bg-neutral-100 p-1"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{item.name}</h4>
                        <p className="text-xs text-neutral-500">{item.colorName}</p>
                        <p className="mt-1 text-xs font-bold">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, -1)}
                          className="rounded-full border p-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, 1)}
                          className="rounded-full border p-1"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="ml-1 text-neutral-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-black/10 pt-4 space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Subtotal (Free Express Shipping)</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push('/checkout');
                    }}
                    className="w-full rounded-full bg-[#16171A] py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* WISHLIST DRAWER */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#F9F8F5] text-[#16171A] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Heart className="h-5 w-5 text-rose-500" /> Saved Wishlist
                </h3>
                <button onClick={() => setIsWishlistOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {wishlist.length === 0 ? (
                  <p className="mt-20 text-center text-sm text-neutral-500">
                    No saved items yet.
                  </p>
                ) : (
                  wishlist.map((product) => {
                    const pid = product._id || product.id;
                    const firstV = product.variants?.[0];
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-xs"
                      >
                        <img
                          src={firstV?.imageUrl || product.image}
                          alt={product.name}
                          className="h-16 w-16 object-contain rounded-lg bg-neutral-100 p-1"
                        />
                        <div className="flex-1">
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={() => setIsWishlistOpen(false)}
                            className="text-sm font-bold hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs font-semibold">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            addToCart(product, firstV);
                            setIsWishlistOpen(false);
                          }}
                          className="rounded-full bg-[#16171A] px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="text-neutral-400 hover:text-rose-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* AUTH / PROFILE MODAL */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-7 text-[#16171A] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="flex items-center gap-2 text-lg font-extrabold">
                  <User className="h-5 w-5" />
                  {user ? 'Your Account' : authTab === 'login' ? 'Sign In' : 'Create Account'}
                </h3>
                <button onClick={() => setIsProfileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {user ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#F6F4EF] p-4">
                    <p className="text-sm font-extrabold">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                    <span className="mt-2 inline-block rounded-full bg-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl border border-black/10 p-3.5 text-sm font-bold hover:bg-neutral-50"
                  >
                    <Package className="h-4 w-4" /> My Orders &amp; Tracking
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-50 p-3.5 text-sm font-bold text-amber-900"
                    >
                      <Shield className="h-4 w-4" /> Admin Console
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 py-3 text-xs font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  {/* Login / Register Switcher */}
                  <div className="mb-5 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('login');
                        setAuthError('');
                      }}
                      className={`rounded-full py-2 transition ${
                        authTab === 'login' ? 'bg-[#16171A] text-white' : 'text-neutral-500'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('register');
                        setAuthError('');
                      }}
                      className={`rounded-full py-2 transition ${
                        authTab === 'register' ? 'bg-[#16171A] text-white' : 'text-neutral-500'
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  {authError && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    {authTab === 'register' && (
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-xl border border-black/15 px-3.5 py-3 text-sm outline-none focus:border-black"
                      />
                    )}
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full rounded-xl border border-black/15 px-3.5 py-3 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 chars)"
                      className="w-full rounded-xl border border-black/15 px-3.5 py-3 text-sm outline-none focus:border-black"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-[#16171A] py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {submitting
                        ? 'Please wait...'
                        : authTab === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}