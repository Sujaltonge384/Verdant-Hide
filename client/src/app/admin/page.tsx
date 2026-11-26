// client/src/app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch<{ orders: any[] }>('/orders'),
      apiFetch<{ products: any[] }>('/products'),
    ])
      .then(([ordRes, prodRes]) => {
        setOrders(ordRes.orders);
        setProducts(prodRes.products);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleStatusChange = async (orderId: string, orderStatus: string) => {
    const res = await apiFetch<{ order: any }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus }),
    });
    setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)));
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] pt-28 pb-20 px-6 md:px-12">
      <Navbar />
      <div className="mx-auto max-w-6xl space-y-10">
        <h1 className="text-3xl font-black">Verdant Hide — Admin Console</h1>

        {error && (
          <div className="rounded-xl bg-rose-100 p-4 text-sm font-semibold text-rose-800">
            {error} — Sign in with Admin credentials (`admin@verdanthide.com` / `Admin@123`) first.
          </div>
        )}

        {/* Orders Table */}
        <section className="rounded-2xl bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-xl font-bold">Customer Orders ({orders.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-neutral-500">
                <tr>
                  <th className="py-3">Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b last:border-0">
                    <td className="py-3 font-mono font-bold">{order.orderNumber}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="rounded-lg border px-2 py-1 text-xs font-semibold"
                      >
                        {['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Products & Stock Summary */}
        <section className="rounded-2xl bg-white p-6 shadow-xs">
          <h2 className="mb-4 text-xl font-bold">Catalog & Variant Stock ({products.length})</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {products.map((p) => (
              <div key={p._id} className="rounded-xl border p-4">
                <div className="flex justify-between font-bold">
                  <span>{p.name}</span>
                  <span>₹{p.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.variants.map((v: any) => (
                    <span key={v._id} className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                      {v.colorName}: <strong>{v.stock}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}