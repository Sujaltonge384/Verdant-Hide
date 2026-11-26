// client/src/app/orders/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MyOrdersPage() {
  const { user, setIsProfileOpen } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch<{ orders: any[] }>('/orders/my-orders')
      .then((res) => setOrders(res.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 pt-28 pb-20 px-6 md:px-12">
        <h1 className="mb-8 text-3xl font-black md:text-4xl">My Orders</h1>

        {!user ? (
          <div className="rounded-3xl bg-white p-10 text-center space-y-4">
            <p className="text-sm text-neutral-600">Sign in to view your placed orders.</p>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="rounded-full bg-[#16171A] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Sign In
            </button>
          </div>
        ) : loading ? (
          <p className="text-sm">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center space-y-4">
            <Package className="mx-auto h-10 w-10 text-neutral-400" />
            <p className="text-sm text-neutral-600">You haven’t placed any orders yet.</p>
            <Link
              href="/collection"
              className="inline-block rounded-full bg-[#16171A] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white"
            >
              Shop Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
                  <div>
                    <span className="font-mono text-sm font-black">{order.orderNumber}</span>
                    <span className="ml-3 text-xs text-neutral-500">
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#E6EBE0] px-3.5 py-1 text-xs font-bold text-[#3F4D32]">
                    {order.orderStatus}
                  </span>
                </div>
                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 text-sm">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg bg-[#F6F4EF] object-contain p-1"
                      />
                      <div className="flex-1">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          {item.colorName} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-black/10 pt-3 text-sm font-black">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}