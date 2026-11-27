// client/src/app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Edit3,
  X,
  Leaf,
  Menu,
  AlertTriangle,
  IndianRupee,
  BarChart3,
  Tag,
  LifeBuoy,
  Upload,
} from 'lucide-react';
import { apiFetch } from '@/services/api';
import { useStore } from '@/context/StoreContext';

type Tab =
  | 'overview'
  | 'analytics'
  | 'catalog'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'support'
  | 'settings';

const THEME_PRESETS: Record<string, any> = {
  obsidian: {
    label: 'Obsidian Dark',
    bg: '#16171A',
    text: '#F5F2EB',
    mutedText: '#A8A59E',
    accent: '#D4AF37',
    buttonBg: '#F5F2EB',
    buttonText: '#16171A',
    isDark: true,
  },
  cognac: {
    label: 'Warm Cognac',
    bg: '#EFE1D3',
    text: '#2B1810',
    mutedText: '#6E4F40',
    accent: '#8C4A27',
    buttonBg: '#2B1810',
    buttonText: '#EFE1D3',
    isDark: false,
  },
  sage: {
    label: 'Sage Moss',
    bg: '#E2E8DA',
    text: '#1F2918',
    mutedText: '#4F5E45',
    accent: '#3F5230',
    buttonBg: '#1F2918',
    buttonText: '#E2E8DA',
    isDark: false,
  },
  navy: {
    label: 'Midnight Slate',
    bg: '#162133',
    text: '#F4EFE6',
    mutedText: '#9DB0C9',
    accent: '#D6A066',
    buttonBg: '#D6A066',
    buttonText: '#162133',
    isDark: true,
  },
};

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  category: 'backpacks',
  categoryLabel: 'Backpacks',
  material: 'Cactus Bio-Leather Composite',
  materialOrigin: 'Zacatecas Nopal Farms, Mexico',
  tagline: '',
  description: '',
  careInstructions: 'Wipe gently with a damp soft cotton cloth.',
  dimensions: '40 cm × 30 cm × 14 cm',
  price: 4999,
  specsText: 'Fits 15" Laptop, Brass Hardware, Water-Resistant',
  componentBreakdown: {
    exterior: 'Plant-derived bio-leather composite (supplier-attributed)',
    backing: 'Recycled polyester / organic cotton textile backing',
    lining: '100% organic cotton twill',
    hardware: 'Brushed zinc-alloy brass finish & recycled zippers',
  },
  featuredInShowcase: false,
  displayOrder: 9,
  isActive: true,
  variants: [
    {
      colorName: 'Obsidian Black',
      variantTitle: '',
      variantNote: '',
      colorHex: '#1A1B1E',
      imageUrl: '/images/backpack.png',
      sku: 'VH-NEW-01',
      stock: 15,
      presetKey: 'obsidian',
      theme: THEME_PRESETS.obsidian,
    },
  ],
};

export default function AdminDashboard() {
  const { user, setIsProfileOpen, showToast } = useStore();

  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [orderFilter, setOrderFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Product Add/Edit Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENT',
    value: 10,
    minOrderAmount: 1999,
    maxDiscount: 1500,
    applicableCategory: 'all',
    usageLimit: 500,
    startsAt: '2026-11-27',
    expiresAt: '2027-12-31',
  });;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, st, cp, sp] = await Promise.all([
        apiFetch<any>('/admin/overview'),
        apiFetch<any>('/admin/settings'),
        apiFetch<any>('/coupons').catch(() => ({ coupons: [] })),
        apiFetch<any>('/support').catch(() => ({ tickets: [] })),
      ]);
      setStats(ov.stats || {});
      setAnalytics(ov.analytics || {});
      setOrders(ov.orders || []);
      setProducts(ov.products || []);
      setCustomers(ov.customers || []);
      setSettings(st.config || {});
      setCoupons(cp.coupons || []);
      setTickets(sp.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Admin authorization required');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const openCreateProduct = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_PRODUCT,
      variants: [
        {
          ...EMPTY_PRODUCT.variants[0],
          sku: `VH-${Date.now().toString().slice(-4)}`,
        },
      ],
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (p: any) => {
    setEditingId(p._id);
    setForm({
      ...p,
      componentBreakdown: p.componentBreakdown || EMPTY_PRODUCT.componentBreakdown,
      specsText: (p.specs || []).join(', '),
      variants: (p.variants || []).map((v: any) => ({
        ...v,
        presetKey: v.theme?.isDark ? 'obsidian' : 'cognac',
      })),
    });
    setProductModalOpen(true);
  };

  const handleVariantImageUpload = async (idx: number, file?: File) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('vh_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const res = await fetch(`${apiBase}/admin/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Cloudinary upload failed');
      }
      const next = [...form.variants];
      next[idx].imageUrl = data.url;
      setForm({ ...form, variants: next });
      showToast('Image uploaded to Cloudinary!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const catLabels: Record<string, string> = {
        backpacks: 'Backpacks',
        'travel-bags': 'Travel Bags',
        handbags: 'Handbags & Satchels',
        wallets: 'Wallets',
        accessories: 'Accessories',
      };
      const payload = {
        ...form,
        slug:
          form.slug.trim() ||
          form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        categoryLabel: catLabels[form.category] || 'Accessories',
        price: Number(form.price),
        displayOrder: Number(form.displayOrder),
        specs: form.specsText
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        variants: form.variants.map((v: any) => ({
          colorName: v.colorName,
          variantTitle: v.variantTitle || form.name,
          variantNote: v.variantNote || form.description,
          colorHex: v.colorHex,
          imageUrl: v.imageUrl,
          sku: v.sku,
          stock: Number(v.stock),
          theme: v.theme || THEME_PRESETS[v.presetKey] || THEME_PRESETS.obsidian,
        })),
      };

      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Product updated in MongoDB!', 'success');
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('New product published to store!', 'success');
      }
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Could not save product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleProductActive = async (p: any) => {
    try {
      await apiFetch(`/products/${p._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      showToast(p.isActive ? 'Moved to Draft (hidden from store)' : 'Published live!', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateOrder = async (orderId: string, orderStatus: string, trackingNumber?: string) => {
    try {
      const res = await apiFetch<{ order: any }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus, trackingNumber }),
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)));
      showToast(`Order updated to ${orderStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ coupon: any }>('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...newCoupon,
          value: Number(newCoupon.value),
          minOrderAmount: Number(newCoupon.minOrderAmount),
          maxDiscount: Number(newCoupon.maxDiscount),
          usageLimit: Number(newCoupon.usageLimit),
        }),
      });
      setCoupons([res.coupon, ...coupons]);
      setNewCoupon({ ...newCoupon, code: '' });
      showToast(`Promo code ${res.coupon.code} created!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      showToast('Coupon deleted.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleCoupon = async (cp: any) => {
    try {
      const res = await apiFetch<{ coupon: any }>(`/coupons/${cp._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !cp.isActive }),
      });
      setCoupons((prev) => prev.map((c) => (c._id === cp._id ? res.coupon : c)));
      showToast(res.coupon.isActive ? `${cp.code} activated!` : `${cp.code} paused.`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateTicket = async (id: string, status: string, adminNote?: string) => {
    try {
      const res = await apiFetch<{ ticket: any }>(`/support/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
      });
      setTickets((prev) => prev.map((t) => (t._id === id ? res.ticket : t)));
      showToast(`Ticket marked ${status}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      showToast('Store configuration saved!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const exportOrdersCSV = () => {
    const header = 'OrderNumber,Customer,Email,Coupon,Discount,Amount,Payment,Status\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},"${o.user?.name || 'Guest'}","${o.user?.email || ''}","${o.couponCode || ''}",${o.discountAmount || 0},${o.totalAmount},${o.paymentMethod},${o.orderStatus}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verdant-hide-orders.csv';
    a.click();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F6F4EF] text-[#16171A] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-lg space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#163C30] text-[#D4AF37]">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black">Verdant Hide Admin Console</h1>
          <p className="text-sm text-neutral-600">
            Please sign in with an authorized <strong>Admin</strong> account to manage catalog,
            inventory, orders, promotions, support, and store configuration.
          </p>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full rounded-full bg-[#163C30] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
          >
            Sign In as Admin
          </button>
          <Link href="/" className="block text-xs font-semibold text-neutral-500 hover:underline">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'ALL' || o.orderStatus === orderFilter;
    const matchesQuery =
      !searchQuery ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'catalog', label: 'Catalog', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Promo Codes', icon: Tag },
    { id: 'support', label: 'Support Queue', icon: LifeBuoy },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5F6F8] text-[#16171A]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-black/10 flex flex-col justify-between p-5 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#163C30] text-[#D4AF37]">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black tracking-wide uppercase">Verdant Hide</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">Admin CMS</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === item.id
                    ? 'bg-[#163C30] text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-black/10 pt-4 space-y-3">
          <div className="rounded-xl bg-[#F5F6F8] p-3">
            <p className="text-xs font-bold">{user.name}</p>
            <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-black/15 py-2.5 text-xs font-bold hover:bg-neutral-50"
          >
            Open Live Site <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-black/10 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg border">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-2xl font-black">
              Hello, {user.name.split(' ')[0]}!
            </h1>
          </div>

          <button
            onClick={openCreateProduct}
            className="inline-flex items-center gap-2 rounded-full bg-[#163C30] px-4 py-2.5 text-xs font-bold text-white hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </header>

        <main className="flex-1 p-5 md:p-8 space-y-8 overflow-x-hidden">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-800">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-neutral-500">Syncing live MongoDB data...</p>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-2xs">
                      <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400">
                        <span>Total Revenue</span>
                        <IndianRupee className="h-4 w-4 text-[#163C30]" />
                      </div>
                      <p className="mt-3 text-3xl font-black">
                        ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="mt-1 text-xs text-emerald-700 font-semibold">Live verified orders</p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-2xs">
                      <p className="text-xs font-bold uppercase text-neutral-400">Total Orders</p>
                      <p className="mt-3 text-3xl font-black">{stats.totalOrders || 0}</p>
                      <p className="mt-1 text-xs text-neutral-500">Across all statuses</p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-2xs">
                      <p className="text-xs font-bold uppercase text-neutral-400">Catalog Health</p>
                      <p className="mt-3 text-3xl font-black">{stats.activeListings || 0} Live</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {stats.draftListings || 0} drafts · {stats.soldOutCount || 0} sold-out SKUs
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 border border-black/5 shadow-2xs">
                      <div className="flex justify-between items-center text-xs font-bold uppercase text-neutral-400">
                        <span>Low Stock Alerts</span>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <p className="mt-3 text-3xl font-black">{stats.lowStockCount || 0}</p>
                      <p className="mt-1 text-xs text-amber-700 font-semibold">Variants with ≤ 5 units</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-extrabold">Recent Orders</h2>
                        <button onClick={() => setTab('orders')} className="text-xs font-bold text-[#163C30]">
                          See All →
                        </button>
                      </div>
                      {orders.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-8 text-center">No orders placed yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.slice(0, 5).map((o) => (
                            <div
                              key={o._id}
                              className="flex items-center justify-between rounded-xl bg-[#F8F9FA] p-3.5 text-sm"
                            >
                              <div>
                                <p className="font-mono font-bold">{o.orderNumber}</p>
                                <p className="text-xs text-neutral-500">{o.user?.name || 'Customer'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                                <span className="text-[11px] font-bold text-[#163C30]">{o.orderStatus}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 rounded-2xl bg-white p-6 border border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-extrabold">Operations Snapshot</h2>
                        <button onClick={() => setTab('support')} className="text-xs font-bold text-[#163C30]">
                          Support →
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between rounded-xl bg-[#F8F9FA] p-3.5 text-sm">
                          <span>Active Listings</span>
                          <strong>{stats.activeListings || 0}</strong>
                        </div>
                        <div className="flex justify-between rounded-xl bg-[#F8F9FA] p-3.5 text-sm">
                          <span>Active Promo Codes</span>
                          <strong>{coupons.filter((c) => c.isActive).length}</strong>
                        </div>
                        <div className="flex justify-between rounded-xl bg-[#F8F9FA] p-3.5 text-sm">
                          <span>Open Support / Grievance Cases</span>
                          <strong className="text-amber-700">
                            {tickets.filter((t) => t.status !== 'Resolved').length}
                          </strong>
                        </div>
                        <div className="flex justify-between rounded-xl bg-[#F8F9FA] p-3.5 text-sm">
                          <span>Registered Customers</span>
                          <strong>{stats.totalCustomers || 0}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {tab === 'analytics' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 border border-black/5">
                      <p className="text-xs font-bold uppercase text-neutral-400">Net Revenue (Excl. Cancelled)</p>
                      <p className="mt-2 text-3xl font-black">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 border border-black/5">
                      <p className="text-xs font-bold uppercase text-neutral-400">Average Order Value (AOV)</p>
                      <p className="mt-2 text-3xl font-black">₹{(stats.aov || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 border border-black/5">
                      <p className="text-xs font-bold uppercase text-neutral-400">Delivered Orders</p>
                      <p className="mt-2 text-3xl font-black">{analytics.statusCounts?.Delivered || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-8 rounded-2xl bg-white p-6 border border-black/5">
                      <h2 className="text-base font-extrabold mb-6">7-Day Revenue Trend</h2>
                      <div className="flex items-end justify-between gap-3 h-52 pt-4 border-b border-black/10 pb-2">
                        {(analytics.dailyTrend || []).map((d: any) => {
                          const maxRev = Math.max(
                            1,
                            ...(analytics.dailyTrend || []).map((x: any) => x.revenue)
                          );
                          const heightPct = Math.max(6, Math.round((d.revenue / maxRev) * 100));
                          return (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                              <span className="text-[10px] font-bold text-neutral-500 opacity-0 group-hover:opacity-100 transition">
                                ₹{d.revenue.toLocaleString('en-IN')}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full max-w-[44px] rounded-t-xl bg-[#163C30] group-hover:bg-[#B58938] transition-all"
                              />
                              <span className="text-[11px] font-semibold text-neutral-500">{d.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-4 rounded-2xl bg-white p-6 border border-black/5 space-y-4">
                      <h2 className="text-base font-extrabold">Revenue by Payment Method</h2>
                      {['UPI', 'CARD', 'COD'].map((method) => {
                        const val = analytics.paymentSplit?.[method] || 0;
                        const pct = stats.totalRevenue ? Math.round((val / stats.totalRevenue) * 100) : 0;
                        return (
                          <div key={method} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{method}</span>
                              <span>₹{val.toLocaleString('en-IN')} ({pct}%)</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                              <div style={{ width: `${pct}%` }} className="h-full bg-[#163C30] rounded-full" />
                            </div>
                          </div>
                        );
                      })}

                      <h3 className="pt-4 text-sm font-extrabold">Fulfilment Pipeline</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(analytics.statusCounts || {}).map(([st, count]: any) => (
                          <div key={st} className="flex justify-between rounded-lg bg-[#F8F9FA] px-3 py-2">
                            <span>{st}</span>
                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 border border-black/5 space-y-4">
                      <h2 className="text-base font-extrabold">Sales by Category</h2>
                      {(analytics.categorySales || []).length === 0 ? (
                        <p className="text-xs text-neutral-500 py-6">Place test orders to populate category sales.</p>
                      ) : (
                        analytics.categorySales.map((c: any) => {
                          const pct = stats.totalRevenue ? Math.round((c.revenue / stats.totalRevenue) * 100) : 0;
                          return (
                            <div key={c.category} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span>{c.category}</span>
                                <span>₹{c.revenue.toLocaleString('en-IN')} ({pct}%)</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                                <div style={{ width: `${pct}%` }} className="h-full bg-[#B58938] rounded-full" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 border border-black/5 space-y-4">
                      <h2 className="text-base font-extrabold">Top-Selling Products</h2>
                      {(analytics.topProducts || []).length === 0 ? (
                        <p className="text-xs text-neutral-500 py-6">No product sales recorded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {analytics.topProducts.map((tp: any) => (
                            <div key={tp.name} className="flex items-center gap-3 rounded-xl bg-[#F8F9FA] p-3">
                              <img src={tp.imageUrl} alt={tp.name} className="h-11 w-11 rounded-lg bg-white object-contain p-1" />
                              <div className="flex-1">
                                <p className="text-sm font-bold">{tp.name}</p>
                                <p className="text-xs text-neutral-500">{tp.units} units sold</p>
                              </div>
                              <p className="text-sm font-black">₹{tp.revenue.toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATALOG MANAGEMENT */}
              {tab === 'catalog' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-black">Product Catalog ({products.length})</h2>
                    <button
                      onClick={openCreateProduct}
                      className="inline-flex items-center gap-2 rounded-full bg-[#163C30] px-5 py-2.5 text-xs font-bold text-white"
                    >
                      <Plus className="h-4 w-4" /> New Product
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-2xl bg-white p-5 border border-black/10 flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={p.variants?.[0]?.imageUrl || '/images/backpack.png'}
                            alt={p.name}
                            className="h-20 w-20 rounded-xl bg-[#F6F4EF] object-contain p-2 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                  p.isActive
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-200 text-neutral-600'
                                }`}
                              >
                                {p.isActive ? 'Published' : 'Draft'}
                              </span>
                              <span className="text-[11px] text-neutral-400 uppercase font-bold">
                                {p.categoryLabel}
                              </span>
                            </div>
                            <h3 className="mt-1 text-base font-extrabold truncate">{p.name}</h3>
                            <p className="text-sm font-black">₹{p.price.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-neutral-500 truncate">{p.material}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {p.variants?.map((v: any) => (
                            <span
                              key={v._id}
                              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs"
                            >
                              <span
                                style={{ backgroundColor: v.colorHex }}
                                className="h-2.5 w-2.5 rounded-full"
                              />
                              {v.colorName}: <strong>{v.stock}</strong>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs font-bold">
                          <button
                            onClick={() => toggleProductActive(p)}
                            className="text-neutral-600 hover:text-black"
                          >
                            {p.isActive ? 'Unpublish' : 'Publish Live'}
                          </button>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="inline-flex items-center gap-1 text-[#163C30] hover:underline"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="inline-flex items-center gap-1 text-rose-600 hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS & FULFILMENT */}
              {tab === 'orders' && (
                <div className="rounded-2xl bg-white p-6 border border-black/10 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-black">Orders ({filteredOrders.length})</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id="adm-ord-search"
                        name="orderSearch"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Order # or Name..."
                        className="rounded-full border border-black/15 px-4 py-2 text-xs outline-none"
                      />
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className="rounded-full border border-black/15 px-3 py-2 text-xs font-bold"
                      >
                        <option value="ALL">All Statuses</option>
                        {['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={exportOrdersCSV}
                        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold hover:bg-neutral-200"
                      >
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b text-xs uppercase text-neutral-500">
                        <tr>
                          <th className="py-3">Order #</th>
                          <th>Customer &amp; City</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Tracking #</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order._id} className="border-b last:border-0">
                            <td className="py-3.5 font-mono font-bold">{order.orderNumber}</td>
                            <td>
                              <p className="font-bold">{order.user?.name || 'Guest'}</p>
                              <p className="text-xs text-neutral-500">
                                {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                              </p>
                            </td>
                            <td className="text-xs">
                              {order.items?.map((i: any, idx: number) => (
                                <div key={idx}>
                                  {i.name} ({i.colorName}) × {i.quantity}
                                </div>
                              ))}
                            </td>
                            <td className="font-bold">
                              ₹{order.totalAmount.toLocaleString('en-IN')}
                              {order.couponCode && (
                                <span className="block text-[10px] text-emerald-700">
                                  ({order.couponCode})
                                </span>
                              )}
                            </td>
                            <td>
                              <input
                                defaultValue={order.trackingNumber || ''}
                                onBlur={(e) =>
                                  updateOrder(order._id, order.orderStatus, e.target.value)
                                }
                                placeholder="Add AWB / Tracking"
                                className="w-36 rounded-lg border px-2 py-1 text-xs"
                              />
                            </td>
                            <td>
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  updateOrder(order._id, e.target.value, order.trackingNumber)
                                }
                                className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
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
                </div>
              )}

              {/* TAB 5: PROMO CODES / COUPONS */}
{tab === 'coupons' && (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
    {/* Left: Full Business Rule Builder */}
    <form
      onSubmit={handleCreateCoupon}
      className="lg:col-span-5 rounded-2xl bg-white p-6 border border-black/10 space-y-4 h-fit"
    >
      <div>
        <h2 className="text-lg font-black">Create Promo Code</h2>
        <p className="text-xs text-neutral-500">
          Set discount %, minimum purchase requirement, validity dates &amp; usage cap.
        </p>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase text-neutral-500">
          Coupon Code
        </label>
        <input
          id="cp-code"
          name="code"
          required
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
          placeholder="e.g. FESTIVE15"
          className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm uppercase font-mono font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Discount Type
          </label>
          <select
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
          >
            <option value="PERCENT">Percentage (%)</option>
            <option value="FLAT">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            {newCoupon.discountType === 'PERCENT' ? 'Discount (%)' : 'Discount (₹)'}
          </label>
          <input
            type="number"
            min={1}
            max={newCoupon.discountType === 'PERCENT' ? 90 : undefined}
            required
            value={newCoupon.value}
            onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Min Purchase (₹)
          </label>
          <input
            type="number"
            min={0}
            value={newCoupon.minOrderAmount}
            onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Max Discount Cap (₹)
          </label>
          <input
            type="number"
            min={0}
            value={newCoupon.maxDiscount}
            onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
            placeholder="0 = no cap"
            className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Valid On Category
          </label>
          <select
            value={newCoupon.applicableCategory}
            onChange={(e) => setNewCoupon({ ...newCoupon, applicableCategory: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
          >
            <option value="all">All Products</option>
            <option value="backpacks">Backpacks Only</option>
            <option value="travel-bags">Travel Bags Only</option>
            <option value="handbags">Handbags &amp; Satchels</option>
            <option value="wallets">Wallets Only</option>
            <option value="accessories">Accessories Only</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Total Usage Limit
          </label>
          <input
            type="number"
            min={1}
            required
            value={newCoupon.usageLimit}
            onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
            className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Valid From
          </label>
          <input
            type="date"
            required
            value={newCoupon.startsAt}
            onChange={(e) => setNewCoupon({ ...newCoupon, startsAt: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase text-neutral-500">
            Valid Until (Expiry)
          </label>
          <input
            type="date"
            required
            value={newCoupon.expiresAt}
            onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Live Plain-English Rule Preview */}
      <div className="rounded-xl bg-[#F6F4EF] p-3 text-xs text-neutral-700">
        <strong>Rule Preview:</strong>{' '}
        {newCoupon.discountType === 'PERCENT'
          ? `${newCoupon.value}% off`
          : `₹${newCoupon.value} off`}
        {newCoupon.maxDiscount > 0 ? ` (up to ₹${newCoupon.maxDiscount})` : ''}{' '}
        on orders ≥ ₹{newCoupon.minOrderAmount} ({newCoupon.applicableCategory}), max{' '}
        {newCoupon.usageLimit} uses, valid {newCoupon.startsAt} → {newCoupon.expiresAt}.
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-[#163C30] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
      >
        Publish Promo Code
      </button>
    </form>

    {/* Right: Manage Existing Coupons */}
    <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-black/10 space-y-4">
      <h2 className="text-lg font-black">All Coupons ({coupons.length})</h2>
      {coupons.length === 0 ? (
        <p className="text-sm text-neutral-500">No coupons created yet.</p>
      ) : (
        <div className="space-y-3">
          {coupons.map((cp) => (
            <div
              key={cp._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-[#163C30]">{cp.code}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      cp.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {cp.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {cp.discountType === 'PERCENT' ? `${cp.value}% off` : `₹${cp.value} off`}
                  {cp.maxDiscount > 0 ? ` (max ₹${cp.maxDiscount})` : ''} · Min Purchase ₹
                  {cp.minOrderAmount} · Category: <strong>{cp.applicableCategory || 'all'}</strong>
                </p>
                <p className="text-[11px] text-neutral-400">
                  Used {cp.usedCount} / {cp.usageLimit} · Expires:{' '}
                  {String(cp.expiresAt).slice(0, 10)}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <button
                  onClick={() => handleToggleCoupon(cp)}
                  className="rounded-full border px-3 py-1.5 hover:bg-neutral-50"
                >
                  {cp.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteCoupon(cp._id)}
                  className="text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
              {/* TAB 6: SUPPORT & GRIEVANCE TICKETS */}
              {tab === 'support' && (
                <div className="rounded-2xl bg-white p-6 border border-black/10 space-y-4">
                  <h2 className="text-xl font-black">Support &amp; Grievance Queue ({tickets.length})</h2>
                  {tickets.length === 0 ? (
                    <p className="text-sm text-neutral-500 py-8 text-center">
                      No customer support or grievance tickets yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((t) => (
                        <div key={t._id} className="rounded-2xl border p-4 space-y-3 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-mono font-bold">{t.caseNumber}</span>
                              <span className="ml-2 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold">
                                {t.topic}
                              </span>
                              {t.orderNumber && (
                                <span className="ml-2 text-xs text-neutral-500">Order: {t.orderNumber}</span>
                              )}
                            </div>
                            <select
                              value={t.status}
                              onChange={(e) => handleUpdateTicket(t._id, e.target.value, t.adminNote)}
                              className="rounded-lg border px-2.5 py-1 text-xs font-bold"
                            >
                              {['Open', 'Acknowledged', 'In Progress', 'Resolved'].map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-neutral-500">
                            From: <strong>{t.name}</strong> ({t.email})
                          </p>
                          <p className="text-sm text-neutral-700 bg-[#F8F9FA] p-3 rounded-xl">{t.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: CUSTOMERS */}
              {tab === 'customers' && (
                <div className="rounded-2xl bg-white p-6 border border-black/10">
                  <h2 className="mb-4 text-xl font-black">Registered Customers ({customers.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b text-xs uppercase text-neutral-500">
                        <tr>
                          <th className="py-3">Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c._id} className="border-b last:border-0">
                            <td className="py-3 font-bold">{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.phone || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: CONFIGURATION & PAYMENT SETTINGS */}
              {tab === 'settings' && settings && (
                <form
                  onSubmit={saveSettings}
                  className="max-w-3xl rounded-2xl bg-white p-6 md:p-8 border border-black/10 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-black">Store &amp; Payment Configuration</h2>
                    <p className="text-xs text-neutral-500">
                      Manage shipping rules, payment methods, and compliance contacts without editing code.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold uppercase text-neutral-500">Brand Name</label>
                      <input
                        value={settings.brandName}
                        onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-neutral-500">Support Email</label>
                      <input
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-neutral-500">Grievance Officer</label>
                      <input
                        value={settings.grievanceOfficer}
                        onChange={(e) => setSettings({ ...settings, grievanceOfficer: e.target.value })}
                        className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-neutral-500">Free Shipping Threshold (₹)</label>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) =>
                          setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                        }
                        className="mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <h3 className="text-sm font-extrabold">Payment Modules</h3>
                    <label className="flex items-center justify-between rounded-xl border p-4 cursor-pointer">
                      <div>
                        <p className="text-sm font-bold">Razorpay (UPI / Cards / Netbanking)</p>
                        <p className="text-xs text-neutral-500">Accept online payments via server verification</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.razorpayEnabled}
                        onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-xl border p-4 cursor-pointer">
                      <div>
                        <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                        <p className="text-xs text-neutral-500">Enable pay-on-delivery option at checkout</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.codEnabled}
                        onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-[#163C30] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white"
                  >
                    Save Configuration
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL (With Cloudinary Upload & Component Breakdown) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 mb-5">
              <h2 className="text-xl font-black">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setProductModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Product Name"
                  className="rounded-xl border px-3.5 py-2.5"
                />
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Price (₹)"
                  className="rounded-xl border px-3.5 py-2.5"
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl border px-3.5 py-2.5"
                >
                  <option value="backpacks">Backpacks</option>
                  <option value="travel-bags">Travel Bags</option>
                  <option value="handbags">Handbags &amp; Satchels</option>
                  <option value="wallets">Wallets</option>
                  <option value="accessories">Accessories</option>
                </select>
                <input
                  required
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  placeholder="Material (e.g. Cactus Bio-Leather Composite)"
                  className="rounded-xl border px-3.5 py-2.5"
                />
              </div>

              <input
                required
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Short Tagline"
                className="w-full rounded-xl border px-3.5 py-2.5"
              />

              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full Product Description"
                className="w-full rounded-xl border px-3.5 py-2.5"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="Dimensions (e.g. 42 × 30 × 15 cm)"
                  className="rounded-xl border px-3.5 py-2.5"
                />
                <input
                  value={form.specsText}
                  onChange={(e) => setForm({ ...form, specsText: e.target.value })}
                  placeholder="Specs (comma separated)"
                  className="rounded-xl border px-3.5 py-2.5"
                />
              </div>

              {/* Component-Level Material Transparency (Anti-Greenwashing) */}
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-500">
                  Component Material Breakdown
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    value={form.componentBreakdown?.exterior || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        componentBreakdown: { ...form.componentBreakdown, exterior: e.target.value },
                      })
                    }
                    placeholder="Exterior Material"
                    className="rounded-xl border px-3 py-2 text-xs"
                  />
                  <input
                    value={form.componentBreakdown?.backing || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        componentBreakdown: { ...form.componentBreakdown, backing: e.target.value },
                      })
                    }
                    placeholder="Textile Backing"
                    className="rounded-xl border px-3 py-2 text-xs"
                  />
                  <input
                    value={form.componentBreakdown?.lining || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        componentBreakdown: { ...form.componentBreakdown, lining: e.target.value },
                      })
                    }
                    placeholder="Interior Lining"
                    className="rounded-xl border px-3 py-2 text-xs"
                  />
                  <input
                    value={form.componentBreakdown?.hardware || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        componentBreakdown: { ...form.componentBreakdown, hardware: e.target.value },
                      })
                    }
                    placeholder="Hardware & Zippers"
                    className="rounded-xl border px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Variants Builder + Cloudinary Upload */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold">Colour Variants ({form.variants.length})</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        variants: [
                          ...form.variants,
                          {
                            colorName: 'New Finish',
                            variantTitle: '',
                            variantNote: '',
                            colorHex: '#556347',
                            imageUrl: '/images/backpack.png',
                            sku: `VH-${Date.now().toString().slice(-4)}`,
                            stock: 10,
                            presetKey: 'sage',
                            theme: THEME_PRESETS.sage,
                          },
                        ],
                      })
                    }
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold"
                  >
                    + Add Colour Variant
                  </button>
                </div>

                {form.variants.map((v: any, idx: number) => (
                  <div key={idx} className="rounded-2xl bg-[#F6F4EF] p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <input
                        required
                        value={v.colorName}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx].colorName = e.target.value;
                          setForm({ ...form, variants: next });
                        }}
                        placeholder="Colour Name"
                        className="rounded-lg bg-white px-3 py-2 text-xs"
                      />
                      <input
                        type="color"
                        value={v.colorHex}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx].colorHex = e.target.value;
                          setForm({ ...form, variants: next });
                        }}
                        className="h-9 w-full rounded-lg bg-white p-1"
                      />
                      <input
                        type="number"
                        required
                        value={v.stock}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx].stock = e.target.value;
                          setForm({ ...form, variants: next });
                        }}
                        placeholder="Stock"
                        className="rounded-lg bg-white px-3 py-2 text-xs"
                      />
                      <select
                        value={v.presetKey}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx].presetKey = e.target.value;
                          next[idx].theme = THEME_PRESETS[e.target.value];
                          setForm({ ...form, variants: next });
                        }}
                        className="rounded-lg bg-white px-2 py-2 text-xs"
                      >
                        {Object.entries(THEME_PRESETS).map(([k, val]) => (
                          <option key={k} value={k}>{val.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        required
                        value={v.imageUrl}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx].imageUrl = e.target.value;
                          setForm({ ...form, variants: next });
                        }}
                        placeholder="Image URL"
                        className="rounded-lg bg-white px-3 py-2 text-xs sm:col-span-2"
                      />
                      <label className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/30 bg-white px-3 py-2 text-xs font-bold cursor-pointer hover:bg-neutral-50">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingIdx === idx ? 'Uploading...' : 'Upload PNG'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleVariantImageUpload(idx, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                    <input
                      required
                      value={v.sku}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx].sku = e.target.value;
                        setForm({ ...form, variants: next });
                      }}
                      placeholder="Unique SKU"
                      className="w-full rounded-lg bg-white px-3 py-2 text-xs"
                    />
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={form.featuredInShowcase}
                  onChange={(e) => setForm({ ...form, featuredInShowcase: e.target.checked })}
                />
                Feature this product in the Homepage Scroll Showcase
              </label>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full rounded-full bg-[#163C30] py-3.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                {savingProduct ? 'Saving to MongoDB...' : editingId ? 'Update Product' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}