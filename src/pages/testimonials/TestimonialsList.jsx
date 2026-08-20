import React, { useState, useEffect } from 'react';
import { Star, Plus, Eye, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const TestimonialsList = () => {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setIsFetching(true);
    try {
      const res = await api.post('/testimonials/get-all');
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleView = (item) => { 
    setSelectedItem(item); 
    setIsSidebarOpen(true); 
  };
  
  const handleDeleteClick = (item) => { 
    setItemToDelete(item); 
    setIsConfirmOpen(true); 
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/testimonials/delete/${itemToDelete.id}`);
        fetchTestimonials();
      } catch (err) {
        console.error(err);
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.post(`/testimonials/update-status/${id}`, { status: newStatus });
      fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    {
      key: 'name', header: 'Customer Details', render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <p className="text-[12px] text-slate-500">{row.role || 'Customer'}</p>
        </div>
      )
    },
    {
      key: 'rating', header: 'Rating', render: (row) => (
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < row.rating ? "currentColor" : "none"} className={i >= row.rating ? "text-slate-300" : ""} />
          ))}
        </div>
      )
    },
    { key: 'comment', header: 'Review', render: (row) => <span className="text-slate-600 truncate max-w-[200px] inline-block">{row.comment}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
          {row.status === 'Active' ? 'Approved' : 'Pending'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => {
        const isActive = row.status === 'Active';
        return (
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => toggleActive(row.id, row.status)}
              className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}
              title={isActive ? "Active" : "Inactive"}
            >
              <span className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></span>
            </button>
            
            <button onClick={() => handleView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View">
              <Eye size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => handleDeleteClick(row)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        );
      }
    }
  ];

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-6 flex items-center justify-between";
  const labelClass = "block text-[12px] font-bold text-slate-600 mb-2";

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10">
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Star size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Testimonials</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage customer reviews and feedback</p>
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by name, comment..."  isLoading={isFetching} />
      
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title="Testimonial Details"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div><label className={labelClass}>Customer</label><p className="font-bold text-slate-900 text-lg">{selectedItem.name}</p></div>
            <div>
              <label className={labelClass}>Rating</label>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill={i < selectedItem.rating ? "currentColor" : "none"} className={i >= selectedItem.rating ? "text-slate-300" : ""} />
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Review content</label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 italic">"{selectedItem.comment}"</p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${selectedItem.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {selectedItem.status === 'Active' ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        )}
      </RightSidebar>
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? It will be removed from the website permanently."
      />
    </div>
  );
};

export default TestimonialsList;
