import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api.js';

const AddExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const cardClass = "bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        date: e.target.date.value,
        category: e.target.category.value,
        description: e.target.description.value,
        amount: parseFloat(e.target.amount.value),
        paidBy: e.target.paidBy.value,
      };
      await api.post('/expenses/create', payload);
      navigate('/expenses');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      <div className={`${cardClass} flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/expenses" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Log New Expense</h1>
        </div>
        <button type="submit" disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} strokeWidth={2.5} />
          {isLoading ? 'Saving...' : 'Save Expense'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Expense Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" name="date" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" className={inputClass} defaultValue="Transport">
                  <option>Transport</option>
                  <option>Office Supplies</option>
                  <option>Marketing</option>
                  <option>Utilities</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <input type="text" name="description" className={inputClass} placeholder="What was this expense for?" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Payment Info</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Amount (₹)</label>
                <input type="number" name="amount" className={`${inputClass} font-bold text-rose-600 text-lg`} placeholder="0.00" required />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select name="paidBy" className={inputClass} defaultValue="Petty Cash">
                  <option>Petty Cash</option>
                  <option>Company Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddExpense;
