import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api.js';

const Reports = () => {
  const [reportData, setReportData] = useState({
    chartData: [],
    topModels: [],
    totalRevenue: '0',
    serviceCalls: 0
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.post('/reports/get');
        if (res.data?.data) {
          setReportData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching reports data:', err);
      }
    };
    fetchReports();
  }, []);

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]";

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10 gap-6">
      <div className={`${cardClass} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <BarChart3 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Analytics Reports</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Sales and service performance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="py-2.5 px-4 rounded-[14px] font-bold text-[14px] bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-2">
            <Calendar size={18} />
            This Year
          </button>
          <button className="py-2.5 px-4 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">RO Units Sold vs Services</h2>
            <TrendingUp className="text-emerald-500" size={20} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="sales" name="New Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="services" name="Maintenance/Services" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className={cardClass}>
             <h2 className="text-lg font-bold text-slate-800 mb-4">Top Selling Models</h2>
             <div className="space-y-4">
               {reportData.topModels.map(item => (
                 <div key={item.name}>
                   <div className="flex justify-between text-sm font-semibold mb-1">
                     <span className="text-slate-700">{item.name}</span>
                     <span className="text-slate-500">{item.count} units</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className={`${item.color} h-2 rounded-full`} style={{ width: item.percent }}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className={`${cardClass} flex flex-col justify-center items-center text-center`}>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-800">₹{reportData.totalRevenue}</h3>
              <p className="text-emerald-500 font-medium text-sm mt-2">+12% vs last year</p>
            </div>
            <div className={`${cardClass} flex flex-col justify-center items-center text-center`}>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Service Calls</p>
              <h3 className="text-3xl font-black text-slate-800">{reportData.serviceCalls}</h3>
              <p className="text-rose-500 font-medium text-sm mt-2">+5% vs last year</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
