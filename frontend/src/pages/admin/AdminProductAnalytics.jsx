import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  MousePointerClick, TrendingUp, Calendar, BarChart2,
  Package, ArrowUpDown, ArrowUp, ArrowDown, Clock,
  RefreshCw, AlertCircle, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoOrDateStr) {
  if (!isoOrDateStr) return '—';
  try {
    const d = new Date(isoOrDateStr);
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return isoOrDateStr; }
}

function formatTime(isoOrDateStr) {
  if (!isoOrDateStr) return '—';
  try {
    const d = new Date(isoOrDateStr);
    return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  } catch { return ''; }
}

function shortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[parseInt(m, 10) - 1]}`;
  } catch { return dateStr; }
}

function getProductImg(product) {
  if (!product) return null;
  const img = product?.productImage;
  if (!img) return null;
  if (Array.isArray(img)) {
    const first = img[0];
    return typeof first === 'string' ? first : first?.url;
  }
  if (typeof img === 'string') return img;
  return img?.url;
}

function getEventImg(event) {
  // Use the denormalized image URL stored at click time
  if (event.productImageUrl) return event.productImageUrl;
  // Fallback: if productId was populated (older records)
  const p = event.productId;
  if (!p) return null;
  if (typeof p === 'object') {
    const imgs = p.images;
    if (!imgs || !imgs.length) return null;
    const first = imgs[0];
    return typeof first === 'string' ? first : first?.url;
  }
  return null;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-white/8 ${className}`} />;
}

// ─── Summary Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'lime', loading }) {
  const colorMap = {
    lime:   { ring: 'border-brand-lime/20 bg-brand-lime/10',   text: 'text-brand-lime',   val: 'text-white' },
    amber:  { ring: 'border-amber-400/20 bg-amber-400/10',    text: 'text-amber-400',    val: 'text-amber-300' },
    sky:    { ring: 'border-sky-400/20 bg-sky-400/10',        text: 'text-sky-400',      val: 'text-sky-300' },
    violet: { ring: 'border-violet-400/20 bg-violet-400/10',  text: 'text-violet-400',   val: 'text-violet-300' },
    orange: { ring: 'border-brand-orange/20 bg-brand-orange/10', text: 'text-brand-orange', val: 'text-brand-orange' },
  };
  const c = colorMap[color] || colorMap.lime;

  return (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all">
      <div className="min-w-0">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-sport block mb-1">{label}</span>
        {loading ? (
          <Skeleton className="h-9 w-24 mb-1" />
        ) : (
          <span className={`font-mono text-3xl font-black ${c.val}`}>{value}</span>
        )}
        {sub && <span className="text-[11px] text-gray-500 block mt-1">{sub}</span>}
      </div>
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.ring}`}>
        <Icon className={`w-6 h-6 ${c.text}`} />
      </div>
    </div>
  );
}

// ─── Custom Tooltip for Charts ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/15 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{shortDate(label)}</p>
      <p className="text-brand-lime font-bold text-sm">{payload[0]?.value} clicks</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProductAnalytics() {
  // ── State ──
  const [summary, setSummary]       = useState(null);
  const [daily, setDaily]           = useState([]);
  const [products, setProducts]     = useState([]);
  const [recentEvents, setRecent]   = useState([]);
  const [chartPreset, setChartPreset] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');
  const [showCustom, setShowCustom]   = useState(false);
  const [productSort, setProductSort] = useState('most');
  const [chartType, setChartType]     = useState('bar'); // 'bar' | 'line'

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDaily, setLoadingDaily]     = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRecent, setLoadingRecent]   = useState(true);

  const [errorSummary, setErrorSummary]   = useState(null);
  const [errorDaily, setErrorDaily]       = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  // ── Fetchers ──
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorSummary(null);
    try {
      const { data } = await analyticsAPI.getSummary();
      setSummary(data.summary);
    } catch (err) {
      setErrorSummary('Failed to load summary');
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchDaily = useCallback(async () => {
    setLoadingDaily(true);
    setErrorDaily(null);
    try {
      let params;
      if (showCustom && customStart && customEnd) {
        params = { startDate: customStart, endDate: customEnd };
      } else {
        params = { preset: chartPreset };
      }
      const { data } = await analyticsAPI.getDaily(params);
      setDaily(data.daily || []);
    } catch (err) {
      setErrorDaily('Failed to load chart data');
      console.error(err);
    } finally {
      setLoadingDaily(false);
    }
  }, [chartPreset, showCustom, customStart, customEnd]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const { data } = await analyticsAPI.getProducts({ sort: productSort });
      setProducts(data.products || []);
    } catch (err) {
      setErrorProducts('Failed to load product data');
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  }, [productSort]);

  const fetchRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const { data } = await analyticsAPI.getRecent({ limit: 20 });
      setRecent(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchSummary();
    fetchDaily();
    fetchProducts();
    fetchRecent();
    toast.success('Analytics refreshed');
  }, [fetchSummary, fetchDaily, fetchProducts, fetchRecent]);

  // ── Effects ──
  useEffect(() => { fetchSummary(); fetchRecent(); }, [fetchSummary, fetchRecent]);
  useEffect(() => { fetchDaily(); }, [fetchDaily]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      toast.error('Please select both start and end date');
      return;
    }
    if (customStart > customEnd) {
      toast.error('Start date must be before end date');
      return;
    }
    setShowCustom(true);
    fetchDaily();
  };

  // ── Render ──
  return (
    <div className="space-y-8">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            Product <span className="text-brand-lime">Analytics</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-sport mt-1">
            Real-time click tracking · India timezone (IST)
          </p>
        </div>
        <button
          onClick={refreshAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sport uppercase tracking-wider text-xs font-bold transition-colors border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Clicks Today"
          value={summary?.clicksToday ?? '—'}
          sub="Since midnight IST"
          icon={MousePointerClick}
          color="lime"
          loading={loadingSummary}
        />
        <StatCard
          label="Yesterday"
          value={summary?.clicksYesterday ?? '—'}
          sub="Previous day"
          icon={Calendar}
          color="sky"
          loading={loadingSummary}
        />
        <StatCard
          label="This Week"
          value={summary?.clicksWeek ?? '—'}
          sub="Last 7 days"
          icon={TrendingUp}
          color="amber"
          loading={loadingSummary}
        />
        <StatCard
          label="This Month"
          value={summary?.clicksMonth ?? '—'}
          sub="Last 30 days"
          icon={BarChart2}
          color="violet"
          loading={loadingSummary}
        />
        <StatCard
          label="Most Clicked"
          value={summary?.mostClicked ? summary.mostClicked.total : '—'}
          sub={summary?.mostClicked?.productName || 'No data yet'}
          icon={Eye}
          color="orange"
          loading={loadingSummary}
        />
        <StatCard
          label="Products Tracked"
          value={summary?.uniqueProducts ?? '—'}
          sub={`${summary?.enquiriesToday ?? 0} WA enquiries today`}
          icon={Package}
          color="lime"
          loading={loadingSummary}
        />
      </div>

      {/* ─── Daily Chart ─── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        {/* Chart header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider text-white">
              Daily Click <span className="text-brand-lime">Trend</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Total product clicks per day (IST)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex border border-white/15 rounded-lg overflow-hidden">
              {[['bar', 'Bar'], ['line', 'Line']].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 text-xs font-sport uppercase tracking-wider transition-all ${
                    chartType === t ? 'bg-brand-lime text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Preset Buttons */}
            {!showCustom && (
              <div className="flex border border-white/15 rounded-lg overflow-hidden">
                {[['7d', '7 Days'], ['30d', '30 Days']].map(([p, l]) => (
                  <button
                    key={p}
                    onClick={() => { setChartPreset(p); setShowCustom(false); }}
                    className={`px-3 py-1.5 text-xs font-sport uppercase tracking-wider transition-all ${
                      chartPreset === p && !showCustom ? 'bg-brand-lime text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Date Range */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customStart}
                onChange={e => { setCustomStart(e.target.value); setShowCustom(false); }}
                className="bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-lime/50"
              />
              <span className="text-gray-500 text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => { setCustomEnd(e.target.value); setShowCustom(false); }}
                className="bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-lime/50"
              />
              <button
                onClick={handleApplyCustom}
                className="px-3 py-1.5 bg-brand-lime text-black text-xs font-bold font-sport uppercase rounded-lg hover:bg-white transition-colors"
              >
                Apply
              </button>
              {showCustom && (
                <button
                  onClick={() => { setShowCustom(false); setCustomStart(''); setCustomEnd(''); }}
                  className="px-3 py-1.5 bg-white/10 text-white text-xs font-sport uppercase rounded-lg hover:bg-white/20 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chart Body */}
        {loadingDaily ? (
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-56 w-full" />
          </div>
        ) : errorDaily ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{errorDaily}</p>
          </div>
        ) : daily.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-500">
            <BarChart2 className="w-10 h-10 opacity-30" />
            <p className="text-sm">No click data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'bar' ? (
              <BarChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(191,255,0,0.05)' }} />
                <Bar dataKey="clicks" fill="#BFFF00" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <LineChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#BFFF00"
                  strokeWidth={2.5}
                  dot={{ fill: '#BFFF00', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#BFFF00' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* ─── Product-wise Table ─── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider text-white">
              Product-wise <span className="text-brand-lime">Clicks</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Click breakdown per product</p>
          </div>
          <div className="flex border border-white/15 rounded-lg overflow-hidden">
            {[['most', 'Most Clicked', ArrowDown], ['least', 'Least Clicked', ArrowUp]].map(([s, l, Icon]) => (
              <button
                key={s}
                onClick={() => setProductSort(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sport uppercase tracking-wider transition-all ${
                  productSort === s ? 'bg-brand-lime text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                {l}
              </button>
            ))}
          </div>
        </div>

        {loadingProducts ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : errorProducts ? (
          <div className="py-12 flex flex-col items-center gap-2 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{errorProducts}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No product click data yet. Visit the merchandise page and click a product!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase font-sport tracking-wider">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-right">Today</th>
                  <th className="pb-3 font-semibold text-right">Week</th>
                  <th className="pb-3 font-semibold text-right">Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((row, i) => {
                  const imgSrc = getProductImg(row);
                  return (
                    <tr key={row._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600 font-mono text-[10px] w-5 flex-shrink-0">{i + 1}</span>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={row.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[200px]">{row.productName}</p>
                            {!row.productExists && (
                              <span className="text-[10px] text-red-400">Product deleted</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-mono text-brand-lime font-bold text-sm">{row.total}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-mono text-white/70">{row.todayClicks}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-mono text-white/70">{row.weekClicks}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="font-mono text-white/70">{row.monthClicks}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Recent Activity ─── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wider text-white">
              Recent Click <span className="text-brand-lime">Activity</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 20 events, newest first</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
            <span className="text-xs text-brand-lime font-sport uppercase tracking-wider">Live</span>
          </div>
        </div>

        {loadingRecent ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : recentEvents.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No click events recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => {
              const imgSrc = getEventImg(event);
              const pName = event.productName || event.productId?.name || 'Unknown Product';
              const isDetail = event.eventType === 'detail_view';

              return (
                <div
                  key={event._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                >
                  {/* Thumbnail */}
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={pName}
                      className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                  )}

                  {/* Product name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{pName}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-sport uppercase tracking-wider mt-0.5 ${
                      isDetail ? 'text-sky-400' : 'text-brand-lime'
                    }`}>
                      {isDetail ? <Eye className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                      {isDetail ? 'Detail View' : 'Card Click'}
                    </span>
                  </div>

                  {/* Date/Time */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-gray-300 font-mono">{formatDate(event.clickedAt)}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{formatTime(event.clickedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
