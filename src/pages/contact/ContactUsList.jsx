import React, { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, CheckCircle } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const ContactUsList = () => {
  const [data, setData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await api.post('/contact-us/get-all');
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
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
        await api.post(`/contact-us/delete/${itemToDelete.id}`);
        fetchContacts();
      } catch (err) {
        console.error(err);
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/contact-us/update-status/${id}`, { status: 'Inactive' });
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    { key: 'name', header: 'Name', render: (row) => <span className="font-bold text-slate-800">{row.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'subject', header: 'Subject', render: (row) => <span className="font-medium text-slate-700">{row.subject}</span> },
    { key: 'createdAt', header: 'Date', render: (row) => <span className="text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      align: 'center',
      render: (row) => {
        const isUnread = row.status === 'Active';
        return (
          <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${
            isUnread ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
          }`}>
            {isUnread ? 'Unread' : 'Read'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => {
        const isUnread = row.status === 'Active';
        return (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => handleView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Message">
              <Eye size={18} strokeWidth={2.5} />
            </button>
            {isUnread && (
              <button onClick={() => markAsRead(row.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Mark as Read">
                <CheckCircle size={18} strokeWidth={2.5} />
              </button>
            )}
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
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Mail size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Contact Us Inquiries</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage messages from the website</p>
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by name, email, subject..." />
      
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title="Inquiry Details"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div><label className={labelClass}>Subject</label><p className="font-bold text-slate-900 text-lg">{selectedItem.subject}</p></div>
            <div><label className={labelClass}>Sender</label><p className="text-slate-800 font-medium">{selectedItem.name}</p><p className="text-sm text-blue-600">{selectedItem.email}</p></div>
            <div><label className={labelClass}>Date Received</label><p className="text-slate-700">{new Date(selectedItem.createdAt).toLocaleDateString()}</p></div>
            <div>
              <label className={labelClass}>Message</label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedItem.message}</p>
              </div>
            </div>
          </div>
        )}
      </RightSidebar>
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? It will be removed permanently."
      />
    </div>
  );
};

export default ContactUsList;
