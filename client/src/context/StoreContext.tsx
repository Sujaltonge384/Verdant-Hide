// client/src/context/StoreContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { apiFetch } from '@/services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: any[];
  role: 'customer' | 'admin';
}


export interface CartItem {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  colorName: string;
  image: string;
  price: number;
  quantity: number;
}

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  user: AuthUser | null;
  authLoading: boolean;
  cart: CartItem[];
  wishlist: any[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isProfileOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addToCart: (product: any, variant?: any) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  cartCount: number;
  cartTotal: number;
}

const isMongoId = (id?: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 3200);
    },
    []
  );

  // Restore session & cart/wishlist on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vh_cart');
    const savedWish = localStorage.getItem('vh_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWish) setWishlist(JSON.parse(savedWish));

    const token = localStorage.getItem('vh_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    apiFetch<{ user: any }>('/auth/me')
      .then((res) => {
        const u = res.user;
        setUser({
             id: u._id,
             name: u.name,
             email: u.email,
             phone: u.phone || '',
             addresses: u.addresses || [],
             role: u.role,
        });
        if (u.wishlist?.length) setWishlist(u.wishlist);
        if (u.cart?.length) {
          const mappedCart: CartItem[] = u.cart
            .filter((c: any) => c.product)
            .map((c: any) => {
              const v =
                c.product.variants?.find((x: any) => x._id === c.variantId) ||
                c.product.variants?.[0];
              return {
                productId: c.product._id,
                variantId: c.variantId,
                slug: c.product.slug,
                name: c.product.name,
                colorName: v?.colorName || 'Default',
                image: v?.imageUrl || '/images/backpack.png',
                price: c.product.price,
                quantity: c.quantity,
              };
            });
          setCart(mappedCart);
        }
      })
      .catch(() => {
        localStorage.removeItem('vh_token');
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('vh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('vh_token', res.token);
    setUser(res.user);
    setIsProfileOpen(false);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('vh_token', res.token);
    setUser(res.user);
    setIsProfileOpen(false);
    showToast(`Account created! Welcome, ${res.user.name}.`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('vh_token');
    setUser(null);
    setIsProfileOpen(false);
    showToast('Signed out cleanly.', 'info');
  };

  const addToCart = (product: any, variant?: any) => {
    const activeVariant = variant || product.variants?.[0];
    const pid = product._id || product.id;
    const vid = activeVariant?._id || 'default';

    if (activeVariant && activeVariant.stock === 0) {
      showToast('This finish is currently out of stock.', 'error');
      return;
    }

    let nextQty = 1;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === pid && i.variantId === vid);
      if (existing) {
        nextQty = existing.quantity + 1;
        return prev.map((i) =>
          i.productId === pid && i.variantId === vid
            ? { ...i, quantity: nextQty }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: pid,
          variantId: vid,
          slug: product.slug,
          name: activeVariant?.variantTitle || product.name,
          colorName: activeVariant?.colorName || product.colorName,
          image: activeVariant?.imageUrl || product.image,
          price: product.price,
          quantity: 1,
        },
      ];
    });

    if (user && isMongoId(pid) && isMongoId(vid)) {
      apiFetch('/user/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: pid, variantId: vid, quantity: nextQty }),
      }).catch(() => {});
    }

    showToast(`Added "${product.name}" to your bag.`, 'success');
    setIsCartOpen(true);
  };

  const updateQty = (productId: string, variantId: string, delta: number) => {
    let updatedQty = 0;
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId === productId && i.variantId === variantId) {
            updatedQty = i.quantity + delta;
            return { ...i, quantity: updatedQty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );

    if (user && isMongoId(productId) && isMongoId(variantId)) {
      apiFetch('/user/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity: Math.max(0, updatedQty) }),
      }).catch(() => {});
    }
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
    if (user && isMongoId(productId) && isMongoId(variantId)) {
      apiFetch('/user/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity: 0 }),
      }).catch(() => {});
    }
    showToast('Removed item from bag.', 'info');
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: any) => {
    const pid = product._id || product.id;
    const exists = wishlist.some((p) => (p._id || p.id) === pid);

    setWishlist((prev) =>
      exists ? prev.filter((p) => (p._id || p.id) !== pid) : [...prev, product]
    );

    if (user && isMongoId(pid)) {
      apiFetch('/user/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId: pid }),
      }).catch(() => {});
    }

    showToast(
      exists ? 'Removed from Wishlist.' : `Saved "${product.name}" to Wishlist!`,
      exists ? 'info' : 'success'
    );
  };

  const isInWishlist = (productId: string) =>
    wishlist.some((p) => (p._id || p.id) === productId);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        user,
        authLoading,
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
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        showToast,
        cartCount,
        cartTotal,
      }}
    >
      {children}

      {/* Global Toast Notification Pill */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-bold shadow-2xl ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : toast.type === 'info'
                ? 'bg-neutral-800 text-white'
                : 'bg-[#16171A] text-[#F5F2EB] border border-[#D4AF37]/40'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};