import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Save, Printer, CreditCard,
  User, Calendar, FileText, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import api from '../../utils/api.js';

const NewInvoice = () => {
  const [items, setItems] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isGstApplied, setIsGstApplied] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);

  // Auto-search state
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customer Form state
  const [customerForm, setCustomerForm] = useState({
    fullName: 'Walk-in Customer',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    const searchCustomers = async () => {
      try {
        const res = await api.post('/customers/search', { q: customerSearch });
        if (res.data?.data) setCustomers(res.data.data);
      } catch (err) {
        console.error('Customer search error', err);
      }
    };
    const delayDebounce = setTimeout(() => { searchCustomers(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        const res = await api.post('/products/search', { q: productSearch });
        if (res.data?.data) setProducts(res.data.data);
      } catch (err) {
        console.error('Product search error', err);
      }
    };
    const delayDebounce = setTimeout(() => { searchProducts(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [productSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const handleAddNewCustomer = async () => {
    setIsSavingCustomer(true);
    try {
      await api.post('/customers/create', customerForm);
      alert('Customer saved successfully!');
      const searchRes = await api.post('/customers/search', { q: customerSearch }).catch(() => null);
      if (searchRes?.data?.data) setCustomers(searchRes.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleSelectProduct = (product) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      handleItemChange(existing.id, 'qty', existing.qty + 1);
    } else {
      setItems([...items, {
        id: product.id,
        name: product.name,
        code: product.slug || `PRD${product.id}`,
        hsn: product.hsn || '8471',
        qty: 1,
        price: Number(product.price) || 0,
        discount: 0,
        gst: 18 // Default GST
      }]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Use API results directly instead of local filtering if searching
  const filteredCustomers = customerSearch ? customers : customers;
  const filteredProducts = productSearch ? products : products;

  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      alert("Please add at least one item to the invoice.");
      return;
    }

    setIsSavingInvoice(true);
    try {
      const payload = {
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        type: isGstApplied ? 'Tax Invoice' : 'Bill of Supply',
        customerData: selectedCustomer || customerForm,
        items,
        subtotal: Number(subtotal).toFixed(2),
        totalDiscount: Number(totalDiscount).toFixed(2),
        taxableAmount: Number(taxableAmount).toFixed(2),
        isGstApplied,
        cgst: Number(cgst).toFixed(2),
        sgst: Number(sgst).toFixed(2),
        igst: Number(igst).toFixed(2),
        roundOff: Number(roundOff).toFixed(2),
        grandTotal: Number(grandTotal).toFixed(2)
      };

      await api.post('/invoices/create', payload);
      alert("Invoice created successfully!");
      // Reset form
      setItems([]);
      setSelectedCustomer(null);
      setCustomerForm({ fullName: 'Walk-in Customer', phoneNumber: '', email: '', address: '', city: '', state: '', pincode: '', country: 'India' });
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating invoice');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  // Calculations
  const calculateItemAmount = (item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Number(item.discount) || 0;
    const gst = Number(item.gst) || 0;
    const base = price * qty;
    const afterDiscount = base - discount;
    const gstAmount = isGstApplied ? (afterDiscount * (gst / 100)) : 0;
    return afterDiscount + gstAmount;
  };

  const subtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  const taxableAmount = subtotal - totalDiscount;

  const totalGstAmount = isGstApplied ? items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Number(item.discount) || 0;
    const gst = Number(item.gst) || 0;
    const afterDiscount = (price * qty) - discount;
    return sum + (afterDiscount * (gst / 100));
  }, 0) : 0;

  const cgst = totalGstAmount / 2;
  const sgst = totalGstAmount / 2;
  const igst = 0;

  const grandTotal = Math.round(taxableAmount + totalGstAmount);
  const roundOff = grandTotal - (taxableAmount + totalGstAmount);
  const balance = amountReceived ? grandTotal - Number(amountReceived) : grandTotal;

  const handleItemChange = (id, field, value) => {
    setItems(items.map(i => {
      if (i.id === id) {
        if (field === 'qty' && value !== '' && Number(value) < 1) return i;
        return { ...i, [field]: value };
      }
      return i;
    }));
  };

  const handleRemove = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const cardClass = "bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[85vh] max-w-[1600px] mx-auto pb-10">
      {/* Main Content - Left Side */}
      <div className="flex-1 flex flex-col gap-6">

        {/* Top Bar Settings */}
        <div className={`${cardClass} flex flex-wrap gap-6 items-center justify-between`}>
          <div className="flex flex-wrap items-center gap-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Create Invoice</h1>

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-5 text-[14px]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700 tracking-wide">{invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Calendar size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Type</span>
            <select
              value={isGstApplied ? 'Tax Invoice' : 'Bill of Supply'}
              onChange={(e) => setIsGstApplied(e.target.value === 'Tax Invoice')}
              className="text-[14px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="Tax Invoice">Tax Invoice</option>
              <option value="Bill of Supply">Bill of Supply</option>
            </select>
          </div>
        </div>

        {/* Customer Section */}
        <div className={cardClass}>
          <div
            className="flex items-center justify-between mb-4 cursor-pointer group"
            onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
          >
            <h2 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Plus size={18} strokeWidth={2.5} />
              </div>
              Add New Customer
            </h2>
            <div className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors">
              {isCustomerExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {isCustomerExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 border-t border-slate-100 pt-5">
              <div><label className={labelClass}>Customer Name</label><input type="text" className={inputClass} value={customerForm.fullName} onChange={e => setCustomerForm({ ...customerForm, fullName: e.target.value })} required /></div>
              <div><label className={labelClass}>Phone Number</label><input type="text" className={inputClass} value={customerForm.phoneNumber} onChange={e => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })} /></div>
              <div><label className={labelClass}>Email Address</label><input type="email" className={inputClass} value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} /></div>
              <div className="lg:col-span-3"><label className={labelClass}>Street Address</label><input type="text" className={inputClass} value={customerForm.address} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} /></div>
              <div><label className={labelClass}>City</label><input type="text" className={inputClass} value={customerForm.city} onChange={e => setCustomerForm({ ...customerForm, city: e.target.value })} /></div>
              <div><label className={labelClass}>State</label><input type="text" className={inputClass} value={customerForm.state} onChange={e => setCustomerForm({ ...customerForm, state: e.target.value })} /></div>
              <div><label className={labelClass}>Pincode</label><input type="text" className={inputClass} value={customerForm.pincode} onChange={e => setCustomerForm({ ...customerForm, pincode: e.target.value })} /></div>
              <div><label className={labelClass}>Country</label><input type="text" className={inputClass} value={customerForm.country} onChange={e => setCustomerForm({ ...customerForm, country: e.target.value })} /></div>

              <div className="lg:col-span-3 flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleAddNewCustomer}
                  disabled={isSavingCustomer}
                  className="w-full sm:w-auto py-2.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  {isSavingCustomer ? 'Saving...' : 'Save as New Customer'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col min-h-[350px] overflow-visible">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50">
            <div className="relative w-full md:flex-1 z-20">
              <Search size={18} className="absolute left-4 top-3.5 text-blue-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                className="w-full pl-11 pr-4 py-2.5 text-[14px] bg-blue-50/50 border border-blue-100 placeholder-blue-400 focus:bg-white text-blue-900 font-bold rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                placeholder="Search Existing Customer..."
              />
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] max-h-60 overflow-y-auto z-50">
                  {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                    <div key={c.id} onMouseDown={(e) => { e.preventDefault(); handleSelectCustomer(c); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                      <p className="font-bold text-slate-800">{c.fullName}</p>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">{c.phoneNumber} • {c.email}</p>
                    </div>
                  )) : <div className="px-4 py-3 text-slate-500 font-medium text-[13px]">No matching customers found</div>}
                </div>
              )}
            </div>

            <div className="relative w-full md:flex-1 z-10">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                onFocus={() => setShowProductDropdown(true)}
                onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                placeholder="Search by Product Name, Code... (Alt + P)"
                className="w-full pl-11 pr-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium text-slate-800 placeholder-slate-400"
              />
              {showProductDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] max-h-60 overflow-y-auto z-50">
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <div key={p.id} onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(p); }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                      </div>
                      <span className="font-black text-blue-600">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    </div>
                  )) : <div className="px-4 py-3 text-slate-500 font-medium text-[13px]">No products found</div>}
                </div>
              )}
            </div>
          </div>

          {selectedCustomer && (
            <div className="px-5 py-3 bg-blue-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[16px]">
                  {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[14px]">{selectedCustomer.fullName}</h3>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {selectedCustomer.phoneNumber} {selectedCustomer.city ? `• ${selectedCustomer.city}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[12px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          <div className="overflow-x-auto flex-1 relative z-0">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-4 w-12 text-center">#</th>
                  <th className="px-5 py-4">Item Details</th>
                  <th className="px-4 py-4 w-32 text-center">Qty</th>
                  <th className="px-4 py-4 text-right">Rate</th>
                  <th className="px-4 py-4 text-right w-24">Disc</th>
                  <th className="px-4 py-4 text-center">GST</th>
                  <th className="px-5 py-4 text-right font-black text-slate-700">Amount</th>
                  <th className="px-5 py-4 text-center w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={24} />
                        </div>
                        <p>No products added. Search and select products above to begin billing.</p>
                      </div>
                    </td>
                  </tr>
                ) : items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[12px] font-semibold text-slate-400 mt-0.5">Code: {item.code} • HSN: {item.hsn}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center border border-slate-200 rounded-lg overflow-hidden w-24 mx-auto bg-white shadow-sm">
                        <button onClick={() => handleItemChange(item.id, 'qty', (Number(item.qty) || 1) - 1)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors">-</button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="w-10 text-center text-[13px] font-bold text-slate-800 py-1.5 border-x border-slate-200 focus:outline-none hide-arrows"
                        />
                        <button onClick={() => handleItemChange(item.id, 'qty', (Number(item.qty) || 0) + 1)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors">+</button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value === '' ? '' : Number(e.target.value))} className="w-20 text-right text-[14px] font-semibold text-slate-700 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-2 hide-arrows outline-none transition-all bg-transparent" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="number" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', e.target.value === '' ? '' : Number(e.target.value))} className="w-16 text-right text-[14px] font-semibold text-rose-500 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-2 hide-arrows outline-none transition-all bg-transparent" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 font-bold text-[12px] rounded-md">
                        {item.gst}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-black text-slate-900 text-[15px]">
                      ₹{calculateItemAmount(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => handleRemove(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Side - Summary & Payment */}
      <div className="xl:w-[400px] w-full flex flex-col gap-6">
        {/* Invoice Summary */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">Summary</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setIsGstApplied(true)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${isGstApplied ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                With GST
              </button>
              <button
                onClick={() => setIsGstApplied(false)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all ${!isGstApplied ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                No GST
              </button>
            </div>
          </div>

          <div className="space-y-3.5 text-[14px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Discount</span>
              <span className="text-emerald-500 font-bold">- ₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-800 font-bold pt-3 pb-1 border-t border-slate-100">
              <span>Taxable Amount</span>
              <span>₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {isGstApplied && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 my-2">
                <div className="flex justify-between text-slate-500 font-semibold text-[13px]">
                  <span>CGST</span>
                  <span className="text-slate-700">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold text-[13px]">
                  <span>SGST</span>
                  <span className="text-slate-700">₹{sgst.toFixed(2)}</span>
                </div>
                {igst > 0 && (
                  <div className="flex justify-between text-slate-500 font-semibold text-[13px]">
                    <span>IGST</span>
                    <span className="text-slate-700">₹{igst.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between text-slate-500 font-medium pt-1">
              <span>Round Off</span>
              <span>₹{roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-5 mt-4 border-t-2 border-slate-100">
              <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
              <span className="text-3xl font-black text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button onClick={() => window.print()} className="col-span-1 py-4 px-4 rounded-[16px] font-bold text-[15px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center justify-center gap-2.5">
            <Printer size={18} strokeWidth={2.5} />
            Print
          </button>

          <button onClick={handleSaveInvoice} disabled={isSavingInvoice} className="col-span-1 py-4 px-4 rounded-[16px] font-black text-[15px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 disabled:opacity-50">
            <CheckCircle2 size={20} strokeWidth={2.5} />
            {isSavingInvoice ? 'Saving...' : 'Save & Pay'}
          </button>
        </div>
        <div className='h-1'></div>
      </div>
    </div>
  );
};

export default NewInvoice;
