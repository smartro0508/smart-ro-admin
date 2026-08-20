import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import RightSidebar from '../../components/RightSidebar';
import api from '../../utils/api.js';

const PurchasesList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const fetchPurchases = async () => {
    setIsLoading(true);
    setIsFetching(true);
    try {
      const res = await api.post('/purchases/get-all', { fromDate, toDate });
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [fromDate, toDate]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/purchases/delete/${itemToDelete.id}`);
        fetchPurchases();
      } catch (err) {
        console.error(err);
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    { key: 'poNumber', header: 'PO Number', render: (row) => <span className="font-bold text-slate-800">{row.poNumber}</span> },
    { key: 'supplierName', header: 'Supplier', render: (row) => <span className="font-semibold text-slate-700">{row.supplierName}</span> },
    { key: 'purchaseDate', header: 'Date', render: (row) => <span className="text-slate-500">{row.purchaseDate}</span> },
    { key: 'totalAmount', header: 'Total Amount', render: (row) => <span className="font-black text-slate-900">₹{Number(row.totalAmount).toLocaleString('en-IN')}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => {
        const statusColors = {
          'Delivered': 'bg-emerald-50 text-emerald-600',
          'In Transit': 'bg-blue-50 text-blue-600',
          'Pending': 'bg-amber-50 text-amber-600'
        };
        return (
          <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${statusColors[row.status] || 'bg-slate-100 text-slate-600'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => { setSelectedPurchase(row); setIsSidebarOpen(true); }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
            title="View Details"
          >
            <Eye size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => navigate(`/purchases/edit/${row.id}`)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
            title="Edit"
          >
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

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10">
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <ShoppingCart size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Purchase Orders</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage inventory purchases from suppliers</p>
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
          <Link to="/purchases/new" className="py-2.5 px-5 rounded-[12px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
            <Plus size={18} strokeWidth={2.5} />
            Create PO
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by PO number, supplier..."  isLoading={isFetching} />

      {/* View Purchase Sidebar */}
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title="Purchase Details"
      >
        {selectedPurchase && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{selectedPurchase.poNumber}</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Date: {selectedPurchase.purchaseDate}</p>
              <div className="mt-3 inline-block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border bg-blue-50 text-blue-600">
                  {selectedPurchase.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">Supplier Details</h4>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <p className="font-bold text-slate-800">{selectedPurchase.supplierName}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">Amount Summary</h4>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between text-[16px] font-extrabold text-slate-800">
                  <span>Grand Total</span>
                  <span className="text-blue-600">₹{Number(selectedPurchase.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </RightSidebar>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete ${itemToDelete?.poNumber}?`}
      />
    </div>
  );
};

export default PurchasesList;
