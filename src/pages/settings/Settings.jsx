import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import api from '../../utils/api.js';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    supportEmail: '',
    phoneNumber: '',
    businessAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.post('/settings/get');
        if (res.data?.data) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.post('/settings/update', settings);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]";
  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-[12px] font-bold text-slate-600 mb-2";

  return (
    <div className="flex flex-col max-w-[1200px] mx-auto pb-10 gap-6">
      <div className={`${cardClass} flex flex-wrap items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <SettingsIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">System Settings</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Configure your SMART-RO platform</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Company Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Company Name</label>
              <input type="text" name="companyName" value={settings.companyName} onChange={handleChange} className={inputClass} placeholder="Enter company name" />
            </div>
            <div>
              <label className={labelClass}>Support Email</label>
              <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className={inputClass} placeholder="Enter support email" />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="text" name="phoneNumber" value={settings.phoneNumber} onChange={handleChange} className={inputClass} placeholder="Enter phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Business Address</label>
              <textarea name="businessAddress" value={settings.businessAddress} onChange={handleChange} className={`${inputClass} min-h-[100px] resize-none`} placeholder="Enter business address"></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
