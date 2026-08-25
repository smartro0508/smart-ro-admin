import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const CustomersList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const fetchCustomers = async () => {
    setIsFetching(true);
    try {
      const res = await api.post('/customers/get-all', { fromDate, toDate });
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fromDate, toDate]);

  const handleView = (item) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = (item) => { setSelectedItem(item); setSidebarMode('edit'); setIsSidebarOpen(true); };
  const handleAdd = () => { navigate('/customers/new'); };
  const handleDeleteClick = (item) => { setItemToDelete(item); setIsConfirmOpen(true); };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/customers/delete/${itemToDelete.id}`);
        fetchCustomers();
      } catch (err) {
        console.error(err);
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleFormSubmit = async (e) => {
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

      if (sidebarMode === 'edit') {
        await api.post(`/customers/update/${selectedItem.id}`, payload);
      } else {
        await api.post('/customers/create', payload);
      }

      await fetchCustomers();
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving customer');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    { key: 'fullName', header: 'Customer Name', render: (row) => <span className="font-bold text-slate-800">{row.fullName}</span> },
    { key: 'email', header: 'Email', render: (row) => <span className="text-slate-600">{row.email || '-'}</span> },
    { key: 'phoneNumber', header: 'Phone', render: (row) => <span className="text-slate-600">{row.phoneNumber || '-'}</span> },
    { key: 'city', header: 'City', render: (row) => <span className="text-slate-600">{row.city || '-'}</span> },
    { key: 'state', header: 'State', render: (row) => <span className="text-slate-600">{row.state || '-'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Details">
            <Eye size={18} strokeWidth={2.5} />
          </button>
          <button onClick={() => handleEdit(row)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
            <Edit size={18} strokeWidth={2.5} />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-6 flex items-center justify-between";
  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-[1600px] mx-auto pb-10 pt-2">
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Customers</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage your client base</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:ring-0 cursor-pointer px-2 py-1 outline-none"
            />
            <span className="text-[11px] font-black text-slate-400">TO</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent border-none text-[13px] font-bold text-slate-700 focus:ring-0 cursor-pointer px-2 py-1 outline-none"
            />
          </div>
          <button onClick={handleAdd} className="py-2.5 px-5 rounded-[12px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
            <Plus size={18} strokeWidth={2.5} />
            Add Customer
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by name, email, phone..." isLoading={isFetching} />

      <RightSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={sidebarMode === 'view' ? 'Customer Details' : 'Edit Customer'}
      >
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-6">
            <div><label className={labelClass}>Customer Name</label><p className="font-bold text-slate-800 text-lg">{selectedItem.fullName}</p></div>
            <div><label className={labelClass}>Phone</label><p className="text-slate-700">{selectedItem.phoneNumber || '-'}</p></div>
            <div><label className={labelClass}>Email</label><p className="text-slate-700">{selectedItem.email}</p></div>

            <div className="pt-4 border-t border-slate-100">
              <label className={labelClass}>Address Information</label>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 mt-2">
                <p className="text-slate-700 text-[14px]"><span className="font-semibold text-slate-500">Street:</span> {selectedItem.address || '-'}</p>
                <p className="text-slate-700 text-[14px]"><span className="font-semibold text-slate-500">City:</span> {selectedItem.city || '-'}</p>
                <p className="text-slate-700 text-[14px]"><span className="font-semibold text-slate-500">State:</span> {selectedItem.state || '-'}</p>
                <p className="text-slate-700 text-[14px]"><span className="font-semibold text-slate-500">Pincode:</span> {selectedItem.pincode || '-'}</p>
                <p className="text-slate-700 text-[14px]"><span className="font-semibold text-slate-500">Country:</span> {selectedItem.country || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div><label className={labelClass}>Customer Name</label><input type="text" name="fullName" className={inputClass} defaultValue={selectedItem?.fullName || ''} required /></div>
            <div><label className={labelClass}>Phone Number</label><input type="text" name="phoneNumber" className={inputClass} defaultValue={selectedItem?.phoneNumber || ''} /></div>
            <div><label className={labelClass}>Email Address</label><input type="email" name="email" className={inputClass} defaultValue={selectedItem?.email || ''} required /></div>

            <div><label className={labelClass}>Street Address</label><input type="text" name="address" className={inputClass} defaultValue={selectedItem?.address || ''} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>City</label><input type="text" name="city" className={inputClass} defaultValue={selectedItem?.city || ''} /></div>
              <div><label className={labelClass}>State</label><input type="text" name="state" className={inputClass} defaultValue={selectedItem?.state || ''} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Pincode</label><input type="text" name="pincode" className={inputClass} defaultValue={selectedItem?.pincode || ''} /></div>
              <div><label className={labelClass}>Country</label><input type="text" name="country" className={inputClass} defaultValue={selectedItem?.country || 'India'} /></div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 rounded-xl font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50">
              {isLoading ? 'Saving...' : sidebarMode === 'edit' ? 'Save Changes' : 'Create Customer'}
            </button>
          </form>
        )}
      </RightSidebar>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${itemToDelete?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default CustomersList;
