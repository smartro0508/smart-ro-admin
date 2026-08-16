import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api.js';

const AddCustomer = () => {
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
        fullName: e.target.fullName.value,
        email: e.target.email.value,
        phoneNumber: e.target.phoneNumber.value,
        address: e.target.address.value,
        city: e.target.city.value,
        state: e.target.state.value,
        pincode: e.target.pincode.value,
        country: e.target.country.value
      };
      await api.post('/customers/create', payload);
      navigate('/customers');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      <div className={`${cardClass} flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/customers" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Add New Customer</h1>
        </div>
        <button type="submit" disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} strokeWidth={2.5} />
          {isLoading ? 'Saving...' : 'Save Customer'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className={cardClass}>
          <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Full Name / Company</label>
              <input type="text" name="fullName" className={inputClass} placeholder="Enter full name" required />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="text" name="phoneNumber" className={inputClass} placeholder="Enter phone number" />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" name="email" className={inputClass} placeholder="Enter email address" required />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input type="text" name="address" className={inputClass} placeholder="Enter full street address" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" name="city" className={inputClass} placeholder="Enter city" />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" name="state" className={inputClass} placeholder="Enter state" />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input type="text" name="pincode" className={inputClass} placeholder="Enter postal code" />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" name="country" className={inputClass} placeholder="Enter country" defaultValue="India" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddCustomer;
