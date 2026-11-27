// client/src/app/checkout/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  CheckCircle2,
  Lock,
  CreditCard,
  Banknote,
  AlertCircle,
  Tag,
  X,
  MapPin,
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { user, cart, cartTotal, clearCart, setIsProfileOpen, showToast } = useStore();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const finalTotal = Math.max(0, cartTotal - (appliedCoupon?.discount || 0));

  const validateAddress = () => {
    if (address.fullName.trim().length < 2) return 'Please enter your full name.';
    if (!/^[6-9]\d{9}$/.test(address.phone))
      return 'Enter a valid 10-digit Indian mobile number.';
    if (address.addressLine.trim().length < 5) return 'Please enter your full street address.';
    if (!address.city.trim() || !address.state.trim()) return 'City and State are required.';
    if (!/^\d{6}$/.test(address.pincode)) return 'Enter a valid 6-digit pincode.';
    return null;
  };

  const handleApplyCoupon = async () => {
    setError('');
    if (!couponInput.trim()) return;
    try {
      const res = await apiFetch<{ code: string; discount: number; message: string }>(
        '/coupons/validate',
        {
          method: 'POST',
          body: JSON.stringify({ code: couponInput, subtotal: cartTotal }),
        }
      );
      setAppliedCoupon({ code: res.code, discount: res.discount });
      showToast(res.message, 'success');
    } catch (err: any) {
      setAppliedCoupon(null);
      showToast(err.message || 'Invalid promo code', 'error');
    }
  };

  const finalizeOrder = async (paymentDetails?: any) => {
    const payload = {
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      shippingAddress: address,
      paymentMethod,
      paymentDetails,
      couponCode: appliedCoupon?.code || '',
    };

    const res = await apiFetch<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    clearCart();
    setPlacedOrder(res.order);
    showToast(`Order ${res.order.orderNumber} placed successfully!`, 'success');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setIsProfileOpen(true);
      showToast('Please sign in to place your order.', 'info');
      return;
    }

    const validationErr = validateAddress();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (!agreedToPolicy) {
      setError('Please accept the Terms of Sale, Privacy Notice, and Return Policy.');
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === 'COD') {
        await finalizeOrder();
        return;
      }

      // Create Razorpay order on Express server (including coupon discount)
      const payOrder = await apiFetch<{
        sandbox: boolean;
        amount: number;
        currency: string;
        razorpayOrderId: string;
      }>('/orders/create-payment', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon?.code || '',
        }),
      });

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (payOrder.sandbox || !rzpKey || !window.Razorpay) {
        await finalizeOrder({ sandbox: true, razorpay_order_id: payOrder.razorpayOrderId });
        return;
      }

      const options = {
        key: rzpKey,
        amount: payOrder.amount,
        currency: payOrder.currency,
        name: 'Verdant Hide Atelier',
        description: 'Plant-Based Leather Order',
        order_id: payOrder.razorpayOrderId,
        prefill: { name: address.fullName, email: user.email, contact: address.phone },
        theme: { color: '#16171A' },
        handler: async (response: any) => {
          await finalizeOrder(response);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment was declined or cancelled. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Could not place order. Please try again.');
      showToast(err.message || 'Order failed', 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 pt-28 pb-20 px-4 sm:px-6 md:px-12">
        {placedOrder ? (
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 sm:p-10 text-center shadow-lg space-y-5">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
            <h1 className="text-3xl font-black">Order Confirmed</h1>
            <p className="text-sm text-neutral-600">
              Thank you for choosing conscious craft. Your order{' '}
              <strong className="text-black font-mono">{placedOrder.orderNumber}</strong> is now{' '}
              <strong>{placedOrder.orderStatus}</strong>.
            </p>
            <div className="rounded-2xl bg-[#F6F4EF] p-4 text-left text-xs space-y-1">
              <p>
                <strong>Deliver To:</strong> {placedOrder.shippingAddress.fullName}
              </p>
              <p>
                {placedOrder.shippingAddress.addressLine}, {placedOrder.shippingAddress.city} -{' '}
                {placedOrder.shippingAddress.pincode}
              </p>
              {placedOrder.couponCode && (
                <p className="text-emerald-700 font-semibold">
                  Promo Applied ({placedOrder.couponCode}): −₹
                  {placedOrder.discountAmount.toLocaleString('en-IN')}
                </p>
              )}
              <p>
                <strong>Total Payable:</strong> ₹
                {placedOrder.totalAmount.toLocaleString('en-IN')} ({placedOrder.paymentMethod})
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/orders"
                className="rounded-full bg-[#16171A] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                View My Orders
              </Link>
              <Link
                href="/collection"
                className="rounded-full border border-black/20 px-7 py-3.5 text-xs font-bold uppercase tracking-widest"
              >
                Continue Exploring
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <h1 className="text-3xl font-black">Your bag is empty</h1>
            <Link
              href="/collection"
              className="inline-block rounded-full bg-[#16171A] px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Left: Shipping Address, Payment & Consent */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="text-3xl font-black">Checkout</h1>
                {!user && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs">
                    <span className="font-semibold text-amber-900">
                      Sign in required to track orders and save address.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(true)}
                      className="rounded-full bg-[#16171A] px-4 py-2 font-bold text-white"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <section className="rounded-3xl bg-white p-6 md:p-8 shadow-xs space-y-4">
                <h2 className="text-lg font-extrabold">1. Shipping Address</h2>

                {/* 1-Click Saved Address Selector */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="space-y-2 pb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Use Saved Address:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.addresses.map((sa: any) => (
                        <button
                          type="button"
                          key={sa._id}
                          onClick={() =>
                            setAddress({
                              fullName: sa.fullName,
                              phone: sa.phone,
                              addressLine: sa.addressLine,
                              city: sa.city,
                              state: sa.state,
                              pincode: sa.pincode,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-[#F6F4EF] px-3.5 py-1.5 text-xs font-bold hover:border-black"
                        >
                          <MapPin className="h-3 w-3 text-[#5A6344]" />
                          {sa.label} ({sa.pincode})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    id="chk-name"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="Full Name"
                    className="rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                  <input
                    id="chk-phone"
                    name="phone"
                    autoComplete="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="10-Digit Mobile Number"
                    className="rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>
                <input
                  id="chk-addr"
                  name="addressLine"
                  autoComplete="street-address"
                  required
                  value={address.addressLine}
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  placeholder="House / Flat No., Building, Street"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <input
                    id="chk-city"
                    name="city"
                    autoComplete="address-level2"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                    className="rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                  <input
                    id="chk-state"
                    name="state"
                    autoComplete="address-level1"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="State"
                    className="rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                  <input
                    id="chk-pin"
                    name="pincode"
                    autoComplete="postal-code"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    placeholder="6-Digit Pincode"
                    className="rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 md:p-8 shadow-xs space-y-4">
                <h2 className="text-lg font-extrabold">2. Payment Method</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: Lock },
                    { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left text-xs font-bold transition ${
                        paymentMethod === m.id
                          ? 'border-black bg-[#16171A] text-white'
                          : 'border-black/15 hover:bg-neutral-50'
                      }`}
                    >
                      <m.icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Legal Policy Consent (Un-ticked by default per DPDP / Consumer Rules) */}
              <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer">
                <input
                  id="chk-policy"
                  name="agreedToPolicy"
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/privacy-terms" className="underline font-semibold text-black">
                    Terms of Sale &amp; Privacy Notice
                  </Link>{' '}
                  and{' '}
                  <Link href="/shipping-returns" className="underline font-semibold text-black">
                    Shipping &amp; 14-Day Return Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={placing}
                className="w-full rounded-full bg-[#16171A] py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-neutral-800 disabled:opacity-50"
              >
                {placing
                  ? 'Processing Order...'
                  : `Place Order — ₹${finalTotal.toLocaleString('en-IN')}`}
              </button>
            </form>

            {/* Right: Order Summary + Promo Code */}
            <aside className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl bg-white p-6 md:p-8 shadow-xs space-y-5">
                <h2 className="text-lg font-extrabold">Order Summary</h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex items-center gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg bg-[#F6F4EF] object-contain p-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          {item.colorName} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="border-t border-black/10 pt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-bold text-emerald-800">
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code} applied
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput('');
                        }}
                        aria-label="Remove promo code"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        id="chk-coupon"
                        name="couponCode"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Promo code (try EARTH10)"
                        className="flex-1 rounded-xl border border-black/15 px-3.5 py-2.5 text-xs uppercase outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="rounded-xl bg-[#16171A] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-black/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>−₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span className="text-emerald-700 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-1 border-t border-black/10">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}