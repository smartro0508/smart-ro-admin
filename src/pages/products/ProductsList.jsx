import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Package } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import api, { BASE_URL } from '../../utils/api.js';

const ProductsList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setIsFetching(true);
    try {
      const res = await api.post('/products/get-all');
      setData(res.data.data.map((item, index) => ({ ...item, sno: index + 1 })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (item) => { 
    setItemToDelete(item); 
    setIsConfirmOpen(true); 
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/products/delete/${itemToDelete.id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-6 flex items-center justify-between";

  const columns = [
    { key: 'sno', header: '#', align: 'center' },
    {
      key: 'mainImage',
      header: 'Image',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
          <img src={row.mainImage ? `${BASE_URL}/uploads/images/${row.mainImage}` : "https://via.placeholder.com/40?text=RO"} alt={row.name} className="w-full h-full object-cover" />
        </div>
      )
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <span className="font-black text-slate-900">
          ₹{Number(row.price).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${
          row.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'isFeatured',
      header: 'Featured',
      align: 'center',
      render: (row) => (
        row.isFeatured ? 
          <span className="inline-flex px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-100">Yes</span> : 
          <span className="text-slate-300">-</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => navigate(`/products/details/${row.id}`)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="View Details"
          >
            <Eye size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => navigate(`/products/edit/${row.id}`)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Edit Product"
          >
            <Edit size={18} strokeWidth={2.5} />
          </button>
          <button onClick={() => handleDeleteClick(row)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-10 pt-2">
      <div className={cardClass}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Products</h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">Manage your product catalog</p>
          </div>
        </div>
        <Link 
          to="/products/new"
          className="py-3 px-5 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Product
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchPlaceholder="Search products by name..." 
       isLoading={isFetching} />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete this product?`}
      />
    </div>
  );
};

export default ProductsList;
