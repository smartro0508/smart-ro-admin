import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const ExpensesList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = async () => {
    setIsFetching(true);
    try {
      const res = await api.post('/expenses/get-all');
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleView = (item) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = (item) => { setSelectedItem(item); setSidebarMode('edit'); setIsSidebarOpen(true); };
  const handleAdd = () => { navigate('/expenses/new'); };
  const handleDeleteClick = (item) => { setItemToDelete(item); setIsConfirmOpen(true); };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/expenses/delete/${itemToDelete.id}`);
        fetchExpenses();
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
        date: e.target.date.value,
        category: e.target.category.value,
        description: e.target.description.value,
        amount: parseFloat(e.target.amount.value),
        paidBy: e.target.paidBy.value,
      };

      if (sidebarMode === 'edit') {
        await api.post(`/expenses/update/${selectedItem.id}`, payload);
      } else {
        await api.post('/expenses/create', payload);
      }
      
      await fetchExpenses();
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving expense');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    { key: 'date', header: 'Date', render: (row) => <span className="font-semibold text-slate-700">{row.date}</span> },
    { 
      key: 'category', 
      header: 'Category', 
      render: (row) => (
        <span className="inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg bg-blue-50 text-blue-600">
          {row.category}
        </span>
      )
    },
    { key: 'description', header: 'Description', render: (row) => <span className="text-slate-600">{row.description}</span> },
    { key: 'paidBy', header: 'Payment Method', render: (row) => <span className="text-slate-500 font-medium">{row.paidBy}</span> },
    { key: 'amount', header: 'Amount', render: (row) => <span className="font-black text-rose-500">₹{Number(row.amount).toLocaleString('en-IN')}</span> },
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
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10">
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Expenses</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Track daily operational expenditures</p>
          </div>
        </div>
        <button onClick={handleAdd} className="py-3 px-5 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
          <Plus size={18} strokeWidth={2.5} />
          Log Expense
        </button>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search expenses by category, description..." isLoading={isFetching} />
      
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title={sidebarMode === 'view' ? 'Expense Details' : 'Edit Expense'}
      >
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-6">
            <div><label className={labelClass}>Amount</label><p className="font-black text-rose-500 text-2xl">₹{Number(selectedItem.amount).toLocaleString('en-IN')}</p></div>
            <div><label className={labelClass}>Date</label><p className="font-semibold text-slate-800">{selectedItem.date}</p></div>
            <div><label className={labelClass}>Category</label><span className="inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg bg-blue-50 text-blue-600">{selectedItem.category}</span></div>
            <div><label className={labelClass}>Description</label><p className="text-slate-700">{selectedItem.description}</p></div>
            <div><label className={labelClass}>Payment Method</label><p className="text-slate-700 font-medium">{selectedItem.paidBy}</p></div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div><label className={labelClass}>Date</label><input type="date" name="date" className={inputClass} defaultValue={selectedItem?.date || ''} required /></div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" className={inputClass} defaultValue={selectedItem?.category || 'Transport'}>
                <option>Transport</option>
                <option>Office Supplies</option>
                <option>Marketing</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>
            </div>
            <div><label className={labelClass}>Description</label><input type="text" name="description" className={inputClass} defaultValue={selectedItem?.description || ''} required /></div>
            <div><label className={labelClass}>Amount (₹)</label><input type="number" name="amount" className={inputClass} defaultValue={selectedItem?.amount || ''} required /></div>
            <div>
              <label className={labelClass}>Payment Method</label>
              <select name="paidBy" className={inputClass} defaultValue={selectedItem?.paidBy || 'Petty Cash'}>
                <option>Petty Cash</option>
                <option>Company Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 rounded-xl font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50">
              {isLoading ? 'Saving...' : sidebarMode === 'edit' ? 'Save Changes' : 'Log Expense'}
            </button>
          </form>
        )}
      </RightSidebar>
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this ${itemToDelete?.category} expense? This action cannot be undone.`}
      />
    </div>
  );
};

export default ExpensesList;
