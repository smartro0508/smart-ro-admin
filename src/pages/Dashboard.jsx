import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Package,
  CreditCard,
  IndianRupee,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../utils/api.js';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, trendUp }) => {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trendUp ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
            {trend}
          </div>
        )}
      </div>

      <div>
        <p className="text-[14px] font-bold text-slate-500 mb-1 uppercase tracking-wide">{title}</p>
        <h3 className="text-[32px] font-black tracking-tight text-slate-900 leading-none">{value}</h3>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <p className="text-[13px] text-slate-500 font-medium">{trendLabel}</p>
          <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-xl hover:bg-blue-50">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    grossVolume: 0,
    totalRevenue: 0,
    outstandingBalances: 0,
    activeProducts: 0,
    totalCustomers: 0,
    operatingExpenses: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.post('/dashboard/get');
        if (res.data?.data) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Overview
            </h1>
            <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-[14px] text-slate-500 font-medium">Your enterprise metrics at a glance.</p>
        </div>
      </div>

      {/* Corporate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Gross Volume"
          value={`₹${Number(dashboardData.grossVolume).toLocaleString()}`}
          icon={IndianRupee}
          trend="+12.5%"
          trendLabel="vs yesterday"
          trendUp={true}
        />
        <StatCard
          title="Total Revenue (YTD)"
          value={`₹${Number(dashboardData.totalRevenue).toLocaleString()}`}
          icon={TrendingUp}
          trend="+8.2%"
          trendLabel="this month"
          trendUp={true}
        />
        <StatCard
          title="Outstanding Balances"
          value={`₹${Number(dashboardData.outstandingBalances).toLocaleString()}`}
          icon={CreditCard}
          trend="-2.4%"
          trendLabel="vs last month"
          trendUp={false}
        />
        <StatCard
          title="Active Products"
          value={dashboardData.activeProducts}
          icon={Package}
          trend="+12"
          trendLabel="new this week"
          trendUp={true}
        />
        <StatCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          icon={Users}
          trend="+4.1%"
          trendLabel="vs last month"
          trendUp={true}
        />
        <StatCard
          title="Operating Expenses"
          value={`₹${Number(dashboardData.operatingExpenses).toLocaleString()}`}
          icon={Wallet}
          trend="+1.2%"
          trendLabel="vs last month"
          trendUp={false}
        />
      </div>

      {/* Analytics Chart - Corporate Card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8 min-h-[500px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              Financial Performance
            </h3>
            <p className="text-[14px] text-slate-500 font-medium mt-2 ml-[52px]">Revenue vs Profit over the last 12 months.</p>
          </div>

          <div className="flex items-center gap-6 mt-6 sm:mt-0 bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></div>
              <span className="text-[13px] font-bold text-slate-700">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-[13px] font-bold text-slate-700">Profit</span>
            </div>
            <div className="w-px h-4 bg-slate-300 mx-2"></div>
            <select className="bg-transparent text-[13px] font-bold text-slate-800 outline-none cursor-pointer">
              <option>Last 12 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: 380 }} className="relative z-10 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                  padding: '16px 20px'
                }}
                itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                labelStyle={{ color: '#64748B', fontWeight: 700, marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2563EB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#2563EB' }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorProfit)"
                activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#10B981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
