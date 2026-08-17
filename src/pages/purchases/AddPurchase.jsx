import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api.js';

const AddPurchase = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([{ itemName: '', quantity: 1, rate: 0 }]);

  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    supplierName: '',
    poNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchPurchase = async () => {
        try {
          const res = await api.post(`/purchases/get/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            setFormData({
              supplierName: data.supplierName || '',
              poNumber: data.poNumber || '',
              purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
              status: data.status || 'Pending'
            });
            if (data.items) {
              const parsedItems = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
              setItems(parsedItems);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchPurchase();
    }
  }, [id, isEditMode]);

  const handleAddItem = () => setItems([...items, { itemName: '', quantity: 1, rate: 0 }]);
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.rate)), 0);
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        supplierName: formData.supplierName,
        poNumber: formData.poNumber,
        purchaseDate: formData.purchaseDate,
        status: formData.status,
        subtotal,
        tax,
        totalAmount,
        items
      };

      if (isEditMode) {
        await api.post(`/purchases/update/${id}`, payload);
      } else {
        await api.post('/purchases/create', payload);
      }
      navigate('/purchases');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  const cardClass = "bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]";
  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-w-[1200px] mx-auto pb-10 gap-6">
      <div className={`${cardClass} flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/purchases" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{isEditMode ? 'Edit' : 'Create'} Purchase Order</h1>
        </div>
        <button type="submit" disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} />
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Purchase' : 'Save Purchase')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={cardClass}>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Supplier & Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>Supplier Name</label>
                <input type="text" name="supplierName" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>PO Number</label>
                <input type="text" name="poNumber" value={formData.poNumber} onChange={e => setFormData({...formData, poNumber: e.target.value})} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Purchase Date</label>
                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className={inputClass} required />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Item List</h2>
              <button type="button" onClick={handleAddItem} className="text-blue-600 text-[13px] font-bold flex items-center gap-1 hover:text-blue-700">
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    {index === 0 && <label className={labelClass}>Item Name</label>}
                    <input type="text" value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} className={inputClass} placeholder="Item description" required />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className={labelClass}>Qty</label>}
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className={inputClass} required />
                  </div>
                  <div className="col-span-3">
                    {index === 0 && <label className={labelClass}>Rate (₹)</label>}
                    <input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className={inputClass} required />
                  </div>
                  <div className={`col-span-1 text-center ${index === 0 ? 'pt-6' : ''}`}>
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-rose-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className={cardClass}>
             <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Summary</h2>
             <div className="space-y-3 mb-6">
               <div className="flex justify-between text-sm font-medium text-slate-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
               <div className="flex justify-between text-sm font-medium text-slate-500"><span>Tax (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
               <div className="flex justify-between text-lg font-black text-slate-800 pt-3 border-t border-slate-100"><span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span></div>
             </div>
             
             <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClass}>
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
             </div>
           </div>
        </div>
      </div>
    </form>
  );
};

export default AddPurchase;
