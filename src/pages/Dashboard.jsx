import React from 'react';
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

const data = [
  { name: 'Jan', revenue: 400000, profit: 240000 },
  { name: 'Feb', revenue: 300000, profit: 139800 },
  { name: 'Mar', revenue: 200000, profit: 98000 },
  { name: 'Apr', revenue: 278000, profit: 190800 },
  { name: 'May', revenue: 189000, profit: 48000 },
  { name: 'Jun', revenue: 239000, profit: 138000 },
  { name: 'Jul', revenue: 349000, profit: 230000 },
  { name: 'Aug', revenue: 420000, profit: 280000 },
  { name: 'Sep', revenue: 510000, profit: 340000 },
  { name: 'Oct', revenue: 480000, profit: 310000 },
  { name: 'Nov', revenue: 600000, profit: 410000 },
  { name: 'Dec', revenue: 845650, profit: 530000 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, trendUp, glowColor, iconBg }) => {
  // Derive watermark color from glowColor safely
  const watermarkColor = glowColor ? glowColor.replace('bg-', 'text-').replace('400', '900') : 'text-gray-900';

  // Extract base color name for border and text utilities if needed
  const colorBase = glowColor ? glowColor.replace('bg-', '').replace('-400', '') : 'gray';

  return (
    <div className={`${iconBg} rounded-[20px] p-6 border border-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:brightness-95 transition-all duration-400 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer`}>

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={18} className={`text-${colorBase}-600`} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-sm bg-white/80 border border-white/50 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
            {trend}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[14px] font-semibold text-gray-600 mb-1.5 tracking-wide">{title}</p>
        <h3 className="text-[28px] font-black tracking-tight text-gray-900 leading-none">{value}</h3>
        <div className="flex items-center justify-between mt-4 border-t border-black/5 pt-3">
          <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">{trendLabel}</p>
          <button className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-white/60">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-10 pb-12 max-w-[1600px] mx-auto pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Overview
            </h1>
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-[15px] text-gray-500 font-medium">Your enterprise metrics at a glance.</p>
        </div>
      </div>

      {/* High-end Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Gross Volume"
          value="₹48,250"
          icon={IndianRupee}
          trend="+12.5%"
          trendLabel="vs yesterday"
          trendUp={true}
          glowColor="bg-blue-400"
          iconBg="bg-blue-100/80"
        />
        <StatCard
          title="Total Revenue (YTD)"
          value="₹8,45,650"
          icon={TrendingUp}
          trend="+8.2%"
          trendLabel="this month"
          trendUp={true}
          glowColor="bg-emerald-400"
          iconBg="bg-emerald-100/80"
        />
        <StatCard
          title="Outstanding Balances"
          value="₹32,500"
          icon={CreditCard}
          trend="-2.4%"
          trendLabel="vs last month"
          trendUp={false}
          glowColor="bg-orange-400"
          iconBg="bg-orange-100/80"
        />
        <StatCard
          title="Active Products"
          value="248"
          icon={Package}
          trend="+12"
          trendLabel="new this week"
          trendUp={true}
          glowColor="bg-purple-400"
          iconBg="bg-purple-100/80"
        />
        <StatCard
          title="Total Customers"
          value="486"
          icon={Users}
          trend="+4.1%"
          trendLabel="vs last month"
          trendUp={true}
          glowColor="bg-cyan-400"
          iconBg="bg-cyan-100/80"
        />
        <StatCard
          title="Operating Expenses"
          value="₹18,500"
          icon={Wallet}
          trend="+1.2%"
          trendLabel="vs last month"
          trendUp={false}
          glowColor="bg-rose-400"
          iconBg="bg-rose-100/80"
        />
      </div>

      {/* Analytics Chart - Premium Glass Card */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 min-h-[500px] flex flex-col relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Activity size={20} className="text-gray-900" />
              </div>
              Financial Performance
            </h3>
            <p className="text-[14px] text-gray-500 font-medium mt-2 ml-13">Revenue vs Profit over the last 12 months.</p>
          </div>

          <div className="flex items-center gap-6 mt-6 sm:mt-0 bg-gray-50/80 p-2.5 px-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
              <span className="text-[13px] font-semibold text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"></div>
              <span className="text-[13px] font-semibold text-gray-600">Profit</span>
            </div>
            <div className="w-px h-4 bg-gray-300 mx-2"></div>
            <select className="bg-transparent text-[13px] font-semibold text-gray-700 outline-none cursor-pointer">
              <option>Last 12 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: 380 }} className="relative z-10 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                  padding: '16px 20px'
                }}
                itemStyle={{ fontWeight: 700, fontSize: '14px' }}
                formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                labelStyle={{ color: '#64748B', fontWeight: 600, marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3B82F6"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#3B82F6' }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10B981"
                strokeWidth={3.5}
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
