import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Clock, CheckCircle2, ShoppingBag, AlertTriangle,
  MessageSquare, ArrowUpRight, TrendingUp, Users, Plus, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsAPI, productsAPI, enquiriesAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalEnquiries: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, productsRes, enquiriesRes] = await Promise.allSettled([
        bookingsAPI.getAll({ limit: 5 }),
        productsAPI.getAllAdmin({ limit: 100 }),
        enquiriesAPI.getAll({ limit: 100 })
      ]);

      let totalBookings = 0;
      let pendingBookings = 0;
      let confirmedBookings = 0;
      let recentBookings = [];

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.success) {
        totalBookings = bookingsRes.value.data.total || 0;
        recentBookings = bookingsRes.value.data.bookings || [];
        // calculate pending / confirmed
        pendingBookings = recentBookings.filter(b => b.status === 'Pending' || b.status === 'Under Review').length;
        confirmedBookings = recentBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
      }

      let totalProducts = 0;
      let lowStockCount = 0;
      if (productsRes.status === 'fulfilled' && productsRes.value.data?.success) {
        const prods = productsRes.value.data.products || [];
        totalProducts = productsRes.value.data.total || prods.length;
        lowStockCount = prods.filter(p => (p.totalStock ?? 0) <= 5).length;
      }

      let totalEnquiries = 0;
      if (enquiriesRes.status === 'fulfilled' && enquiriesRes.value.data?.success) {
        totalEnquiries = enquiriesRes.value.data.total || 0;
      }

      setStats({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalProducts,
        lowStockCount,
        totalEnquiries,
        recentBookings
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'text-brand-lime bg-brand-lime/10 border-brand-lime/30';
      case 'Pending':
      case 'Under Review':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'Quotation Sent':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8">

      {/* ─── Top Header & Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Executive <span className="text-brand-lime">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Real-time Cricket Media & Merchandise Operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-lime text-black font-sport uppercase tracking-wider text-xs font-bold hover:bg-white transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            to="/admin/bookings"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors border border-white/10"
          >
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* ─── KPI Metric Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Bookings */}
        <div className="p-6 rounded-2xl bg-brand-black border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-sport block mb-1">
              Total Booking Requests
            </span>
            <span className="font-mono text-3xl font-black text-white">
              {stats.totalBookings}
            </span>
            <span className="text-[10px] text-gray-500 block mt-1">Cameraman & Media shoots</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="p-6 rounded-2xl bg-brand-black border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-sport block mb-1">
              Pending / Under Review
            </span>
            <span className="font-mono text-3xl font-black text-amber-400">
              {stats.pendingBookings}
            </span>
            <span className="text-[10px] text-amber-400/80 block mt-1">Requires admin review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products & Stock */}
        <div className="p-6 rounded-2xl bg-brand-black border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-sport block mb-1">
              Merchandise Catalog
            </span>
            <span className="font-mono text-3xl font-black text-white">
              {stats.totalProducts}
            </span>
            <span className="text-[10px] text-brand-lime block mt-1">
              {stats.lowStockCount > 0 ? `${stats.lowStockCount} Low stock items` : 'Stock healthy'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Customer Enquiries */}
        <div className="p-6 rounded-2xl bg-brand-black border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-sport block mb-1">
              General Inquiries
            </span>
            <span className="font-mono text-3xl font-black text-white">
              {stats.totalEnquiries}
            </span>
            <span className="text-[10px] text-gray-500 block mt-1">Live stream & merch questions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── Recent Bookings Table ─── */}
      <div className="bg-brand-black border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider text-white">
              Recent Cameraman Booking Requests
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Incoming matches requiring review, quotation & crew assignment</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs text-brand-lime hover:underline font-sport uppercase tracking-wider flex items-center gap-1"
          >
            View All ({stats.totalBookings})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentBookings && stats.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase font-sport tracking-wider">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Match Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-brand-lime font-bold">
                      {b.referenceNumber}
                    </td>
                    <td className="py-3.5 font-medium text-white">
                      {b.customerName}
                      <span className="block text-[11px] text-gray-500 font-mono">{b.mobileNumber}</span>
                    </td>
                    <td className="py-3.5 text-gray-300">
                      {b.serviceType}
                    </td>
                    <td className="py-3.5 text-gray-300">
                      {b.matchDate ? new Date(b.matchDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-sport uppercase tracking-wider border font-bold ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/bookings/${b._id}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-lime hover:text-black text-gray-300 transition-colors font-sport uppercase text-[11px] tracking-wider"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-xs">
            No booking requests received yet.
          </div>
        )}
      </div>

    </div>
  );
}
