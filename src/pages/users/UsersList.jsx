import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Plus, Edit, Trash2, Shield, Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const UsersList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdmins = async () => {
    setIsFetching(true);
    try {
      const res = await api.post('/admins/get-all').catch(() => null);
      if (res && res.data && res.data.data) {
        setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleView = (item) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = (item) => { setSelectedItem(item); setSidebarMode('edit'); setIsSidebarOpen(true); };
  const handleAdd = () => { navigate('/users/new'); };
  const handleDeleteClick = (item) => { setItemToDelete(item); setIsConfirmOpen(true); };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setData(data.filter(d => d.id !== itemToDelete.id)); // Mocked delete for Admins if API doesn't fully support it yet
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    { key: 'name', header: 'Team Member', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          {row.name ? row.name.charAt(0) : 'U'}
        </div>
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <p className="text-[12px] text-slate-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', header: 'Role', render: (row) => (
      <span className="flex items-center gap-1.5 font-medium text-slate-700">
        <Shield size={14} className={row.role === 'Super Admin' ? 'text-rose-500' : 'text-blue-500'} />
        {row.role || 'Admin'}
      </span>
    )},
    { 
      key: 'status', 
      header: 'Status', 
      align: 'center',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${
          row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {row.status || 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handleView(row)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View">
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
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
            <UserCog size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Team Members</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage admin and staff access</p>
          </div>
        </div>
        <button onClick={handleAdd} className="py-3 px-5 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
          <Plus size={18} strokeWidth={2.5} />
          Add User
        </button>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder="Search by name, email, role..." isLoading={isFetching} />
      
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title={sidebarMode === 'view' ? 'User Details' : 'Edit User'}
      >
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                {selectedItem.name ? selectedItem.name.charAt(0) : 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{selectedItem.name}</p>
                <p className="text-slate-500">{selectedItem.email}</p>
                {selectedItem.phone && <p className="text-slate-500 text-sm mt-1">📞 {selectedItem.phone}</p>}
              </div>
            </div>
            {selectedItem.address && (
              <div><label className={labelClass}>Address</label><p className="font-medium text-slate-800">{selectedItem.address}</p></div>
            )}
            <div><label className={labelClass}>Role</label><p className="font-medium text-slate-800">{selectedItem.role || 'Admin'}</p></div>
            <div>
              <label className={labelClass}>Status</label>
              <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${selectedItem.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                {selectedItem.status || 'Active'}
              </span>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={async (e) => { 
            e.preventDefault(); 
            setIsLoading(true);
            try {
              const payload = {
                name: e.target.name.value,
                email: e.target.email.value,
                role: e.target.role.value,
                status: e.target.status.value,
                phone: e.target.phone.value,
                address: e.target.address.value,
                password: sidebarMode === 'add' ? 'defaultPassword123' : undefined
              };
              
              if (sidebarMode === 'edit') {
                await api.post(`/admins/update/${selectedItem.id}`, payload);
              } else {
                await api.post('/auth/register', payload);
              }
              
              setIsSidebarOpen(false);
              fetchAdmins();
            } catch (err) {
              console.error(err);
              alert(err.response?.data?.message || 'Error saving user');
            } finally {
              setIsLoading(false);
            }
          }}>
            <div><label className={labelClass}>Full Name</label><input type="text" name="name" className={inputClass} defaultValue={selectedItem?.name || ''} required /></div>
            <div><label className={labelClass}>Email Address</label><input type="email" name="email" className={inputClass} defaultValue={selectedItem?.email || ''} required /></div>
            <div><label className={labelClass}>Phone Number</label><input type="text" name="phone" className={inputClass} defaultValue={selectedItem?.phone || ''} /></div>
            <div><label className={labelClass}>Address</label><textarea name="address" className={`${inputClass} resize-y min-h-[80px]`} defaultValue={selectedItem?.address || ''}></textarea></div>
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" className={inputClass} defaultValue={selectedItem?.role || 'Technician'}>
                <option value="Super Admin">Super Admin</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Technician">Technician</option>
                <option value="Support Staff">Support Staff</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" className={inputClass} defaultValue={selectedItem?.status || 'Active'}>
                <option value="Active">Active</option>
                <option value="Offline">Offline</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 rounded-xl font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all">
              {isLoading ? 'Saving...' : (sidebarMode === 'edit' ? 'Save Changes' : 'Create User')}
            </button>
          </form>
        )}
      </RightSidebar>
      
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to remove ${itemToDelete?.name} from the system?`}
      />
    </div>
  );
};

export default UsersList;
