// client/src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Package,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function getInitials(name?: string): string {
  if (!name) return 'VH';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfilePage() {
  const {
    user,
    wishlist,
    logout,
    setIsProfileOpen,
    showToast,
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);

  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || '');
    setAddresses(user.addresses || []);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone }),
      });
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ addresses: any[] }>('/user/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddr),
      });
      setAddresses(res.addresses);
      setShowAddrForm(false);
      setNewAddr({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
      });
      showToast('Address saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid address details', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await apiFetch<{ addresses: any[] }>(`/user/addresses/${addressId}`, {
        method: 'DELETE',
      });
      setAddresses(res.addresses);
      showToast('Address removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not remove address', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 pt-28 pb-20 px-4 sm:px-6 md:px-12">
        {!user ? (
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 sm:p-10 text-center shadow-sm space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16171A] text-[#D4AF37] text-xl font-black">
              VH
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Your Verdant Account</h1>
            <p className="text-sm text-neutral-600">
              Sign in or create an account to manage saved addresses, track orders, and sync your wishlist.
            </p>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-full rounded-full bg-[#16171A] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
            >
              Sign In / Create Account
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#16171A] p-6 sm:p-8 text-[#F5F2EB] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#16171A] text-xl sm:text-2xl font-black tracking-wider">
                  {getInitials(user.name)}
                </div>
                <div>
                  <span className="rounded-full border border-[#D4AF37]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {user.role}
                  </span>
                  <h1 className="mt-1.5 text-2xl sm:text-3xl font-black">{user.name}</h1>
                  <p className="text-xs sm:text-sm text-neutral-400">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#16171A]"
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href="/orders"
                className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Package className="h-6 w-6 text-[#5A6344]" />
                  <div>
                    <h2 className="font-extrabold">My Orders</h2>
                    <p className="text-xs text-neutral-500">Track shipments &amp; receipts</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">View →</span>
              </Link>

              <Link
                href="/collection"
                className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <Heart className="h-6 w-6 text-rose-500" />
                  <div>
                    <h2 className="font-extrabold">Saved Wishlist ({wishlist.length})</h2>
                    <p className="text-xs text-neutral-500">Pieces saved for later</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Shop →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Personal Info Form */}
              <form
                onSubmit={handleSaveProfile}
                className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-4"
              >
                <h2 className="text-lg font-extrabold">Personal Details</h2>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-neutral-500">
                    Full Name
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-neutral-500">
                    Mobile Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full rounded-full bg-[#16171A] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              {/* Saved Addresses */}
              <div className="lg:col-span-7 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold">
                    <MapPin className="h-5 w-5 text-[#5A6344]" /> Saved Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddrForm(!showAddrForm)}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3.5 py-2 text-xs font-bold hover:bg-neutral-200"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={handleAddAddress} className="rounded-2xl bg-[#F6F4EF] p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        required
                        value={newAddr.label}
                        onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                        placeholder="Label (Home / Office)"
                        className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                      />
                      <input
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        placeholder="Recipient Full Name"
                        className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <input
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      placeholder="10-Digit Mobile"
                      className="w-full rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                    />
                    <input
                      required
                      value={newAddr.addressLine}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                      placeholder="Flat / Building / Street"
                      className="w-full rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        placeholder="City"
                        className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                      />
                      <input
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        placeholder="State"
                        className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                      />
                      <input
                        required
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        placeholder="Pincode"
                        className="rounded-xl bg-white px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#16171A] py-2.5 text-xs font-bold uppercase tracking-widest text-white"
                    >
                      Save Address
                    </button>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No saved addresses yet. Add one for faster 1-click checkout.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="flex items-start justify-between rounded-2xl border border-black/10 p-4 text-sm"
                      >
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6EBE0] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#3F4D32]">
                            <CheckCircle2 className="h-3 w-3" /> {addr.label}
                          </span>
                          <p className="mt-1.5 font-bold">{addr.fullName} · {addr.phone}</p>
                          <p className="text-xs text-neutral-600">
                            {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-neutral-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}