// client/src/app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    topic: 'Order Status',
    message: '',
  });
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch<{ ticket: any }>('/support', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setTicket(res.ticket);
    } catch (err: any) {
      setError(err.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 pt-28 pb-20 px-6 md:px-12">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#5A6344]">
          Client Care &amp; Grievance Redressal
        </span>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">Contact &amp; Support</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-xs space-y-3 text-sm">
              <h2 className="flex items-center gap-2 font-extrabold text-base">
                <Mail className="h-4 w-4 text-[#5A6344]" /> Customer Care
              </h2>
              <p className="text-neutral-600">Email: support@verdanthide.com</p>
              <p className="text-neutral-600">Hours: Mon–Sat, 10:00 AM – 6:30 PM IST</p>
              <p className="text-xs text-neutral-500">
                Acknowledgement within 48 hours; resolution within 30 days under Consumer Protection (E-Commerce) Rules, 2020.
              </p>
            </div>

            <div className="rounded-3xl bg-[#16171A] text-[#F5F2EB] p-6 space-y-2 text-xs">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#D4AF37]">
                <ShieldCheck className="h-4 w-4" /> Legal Entity &amp; Grievance Officer
              </h2>
              <p><strong>Seller Entity:</strong> Verdant Hide Atelier *(Update registered legal entity before go-live)*</p>
              <p><strong>Grievance Officer:</strong> Compliance Officer, Verdant Hide</p>
              <p><strong>Grievance Email:</strong> grievance@verdanthide.com</p>
              <p><strong>Registered Office:</strong> [Registered Business Address, India]</p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl bg-white p-6 md:p-8 shadow-xs">
            {ticket ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="text-2xl font-black">Ticket Created</h2>
                <p className="text-sm text-neutral-600">
                  Reference ID: <strong className="font-mono text-black">{ticket.caseNumber}</strong>.
                  We have logged your enquiry and will respond within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <h2 className="text-lg font-extrabold">Submit an Enquiry or Return Request</h2>
                {error && <p className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    id="sup-name"
                    name="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your Full Name"
                    className="rounded-xl border border-black/15 px-4 py-3 outline-none"
                  />
                  <input
                    id="sup-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email Address"
                    className="rounded-xl border border-black/15 px-4 py-3 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="rounded-xl border border-black/15 px-4 py-3 outline-none"
                  >
                    {['Order Status', 'Return / Exchange', 'Repair / Warranty', 'Material Query', 'Grievance', 'Other'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    id="sup-order"
                    name="orderNumber"
                    value={form.orderNumber}
                    onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                    placeholder="Order # (optional, e.g. VH-123456)"
                    className="rounded-xl border border-black/15 px-4 py-3 outline-none"
                  />
                </div>
                <textarea
                  id="sup-msg"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your query or issue..."
                  className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#16171A] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}