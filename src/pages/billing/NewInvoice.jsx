import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Save, CreditCard,
  User, Calendar, FileText, ChevronDown, ChevronUp, CheckCircle2, Loader2
} from 'lucide-react';
import api from '../../utils/api.js';

const NewInvoice = () => {
  const [items, setItems] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isGstApplied, setIsGstApplied] = useState(true);
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('Auto-generated');

  // Auto-search state
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isSearchingServices, setIsSearchingServices] = useState(false);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers([]);
      setIsSearchingCustomers(false);
      return;
    }
    setIsSearchingCustomers(true);
    const searchCustomers = async () => {
      try {
        const res = await api.post('/customers/search', { q: customerSearch });
        if (res.data?.data) setCustomers(res.data.data);
      } catch (err) {
        console.error('Customer search error', err);
      } finally {
        setIsSearchingCustomers(false);
      }
    };
    const delayDebounce = setTimeout(() => { searchCustomers(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  useEffect(() => {
    if (!productSearch.trim()) {
      setProducts([]);
      setIsSearchingProducts(false);
      return;
    }
    setIsSearchingProducts(true);
    const searchProducts = async () => {
      try {
        const res = await api.post('/invoice-products/search', { q: productSearch });
        if (res.data?.data) setProducts(res.data.data);
      } catch (err) {
        console.error('Product search error', err);
      } finally {
        setIsSearchingProducts(false);
      }
    };
    const delayDebounce = setTimeout(() => { searchProducts(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [productSearch]);

  const [services, setServices] = useState([]);
  
  useEffect(() => {
    if (!serviceSearch.trim()) {
      setServices([]);
      setIsSearchingServices(false);
      return;
    }
    setIsSearchingServices(true);
    const searchServices = async () => {
      try {
        const res = await api.post('/invoice-services/search', { q: serviceSearch });
        if (res.data?.data) setServices(res.data.data);
      } catch (err) {
        console.error('Service search error', err);
      } finally {
        setIsSearchingServices(false);
      }
    };
    const delayDebounce = setTimeout(() => { searchServices(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [serviceSearch]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleSelectProduct = (product) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      handleItemChange(existing.id, 'qty', existing.qty + 1);
    } else {
      setItems([...items, {
        id: product.id,
        name: product.productname || product.name,
        description: product.description || '',
        code: product.slug || `PRD${String(product.id).substring(0,4)}`,
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

  const handleSelectService = (service) => {
    let newItems = [...items];
    const svcCost = Number(service.servicecost) || 0;
    const prdCost = Number(service.serviceproductcost) || 0;

    if (svcCost > 0 || (svcCost === 0 && prdCost === 0)) {
      const existingSvc = newItems.find(i => i.id === `${service.id}_svc`);
      if (existingSvc) {
        existingSvc.qty += 1;
      } else {
        newItems.push({
          id: `${service.id}_svc`,
          name: `${service.servicename} (Service)`,
          description: service.description || '',
          code: `SVC${service.id.substring(0,4)}`,
          hsn: '9983', // Default SAC for services
          qty: 1,
          price: svcCost,
          discount: 0,
          gst: 18 // Default GST
        });
      }
    }

    if (prdCost > 0) {
      const existingPrd = newItems.find(i => i.id === `${service.id}_prd`);
      if (existingPrd) {
        existingPrd.qty += 1;
      } else {
        newItems.push({
          id: `${service.id}_prd`,
          name: `${service.servicename} (Product)`,
          description: service.description || '',
          code: `PRD${service.id.substring(0,4)}`,
          hsn: '8471', // Default HSN for products
          qty: 1,
          price: prdCost,
          discount: 0,
          gst: 18 // Default GST
        });
      }
    }

    setItems(newItems);
    setServiceSearch('');
    setShowServiceDropdown(false);
  };

  // Use API results directly instead of local filtering if searching
  const filteredCustomers = customerSearch ? customers : customers;
  const filteredProducts = productSearch ? products : products;
  const filteredServices = serviceSearch ? services : services;

  const [isSavingInvoice, setIsSavingInvoice] = useState(false);

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      alert("Please add at least one item to the invoice.");
      return;
    }
    if (Number(globalDiscount) > subtotal) {
      alert("Discount amount cannot be greater than the invoice subtotal.");
      return;
    }

    setIsSavingInvoice(true);
    try {
      const payload = {
        invoiceDate: new Date().toISOString().split('T')[0],
        type: isGstApplied ? 'Tax Invoice' : 'Bill of Supply',
        customerData: selectedCustomer || { fullName: 'Walk-in Customer' },
        items,
        subtotal: Number(subtotal).toFixed(2),
        totalDiscount: Number(totalDiscount).toFixed(2),
        taxableAmount: Number(taxableAmount).toFixed(2),
        isGstApplied,
        cgst: Number(cgst).toFixed(2),
        sgst: Number(sgst).toFixed(2),
        igst: Number(igst).toFixed(2),
        roundOff: Number(roundOff).toFixed(2),
        grandTotal: Number(grandTotal).toFixed(2),
        paymentmethod: paymentMethod || 'UPI',
        paymentstatus: amountReceived && Number(amountReceived) < grandTotal ? 'Pending' : 'Paid',
        termsnotes: 'one year warranty'
      };

      await api.post('/invoices/create', payload);
      alert("Invoice created successfully!");
      // Reset form
      setItems([]);
      setSelectedCustomer(null);
      setInvoiceNumber('Auto-generated');
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
    const gst = Number(item.gst) || 0;
    const base = price * qty;
    const gstAmount = isGstApplied ? (base * (gst / 100)) : 0;
    return base + gstAmount;
  };

  const subtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 0)), 0);
  // Ensure totalDiscount does not exceed subtotal for calculation
  const totalDiscount = Math.min(Number(globalDiscount) || 0, subtotal);
  const taxableAmount = subtotal - totalDiscount;

  const totalGstAmount = isGstApplied ? items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const gst = Number(item.gst) || 0;

    const itemSubtotal = price * qty;
    const itemProportion = subtotal > 0 ? (itemSubtotal / subtotal) : 0;
    const itemDiscount = totalDiscount * itemProportion;

    const afterDiscount = itemSubtotal - itemDiscount;
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

  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const cardClass = "bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden";

  return (
    <div className="flex flex-col gap-8 min-h-[85vh] max-w-[1600px] w-full min-w-0 mx-auto pb-12 font-sans">
      {/* Main Content - Left Side */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">

        {/* Top Bar Settings */}
        <div className={`${cardClass} bg-white flex flex-wrap gap-6 items-center justify-between border-t-4 border-t-blue-600 min-w-0`}>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Invoice</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Fill out the details below to generate a new invoice</p>
            </div>

            <div className="h-12 w-px bg-gray-200 hidden md:block"></div>

            <div className="flex items-center gap-6 text-[14px]">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm border border-slate-100">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Invoice No.</p>
                  <span className="font-bold text-gray-800 tracking-wide">{invoiceNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm border border-slate-100">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Date</p>
                  <span className="font-bold text-gray-800">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Type</span>
            <select
              value={isGstApplied ? 'Tax Invoice' : 'Bill of Supply'}
              onChange={(e) => setIsGstApplied(e.target.value === 'Tax Invoice')}
              className="text-[14px] font-bold text-gray-800 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="Tax Invoice">Tax Invoice</option>
              <option value="Bill of Supply">Bill of Supply</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col min-h-[400px] overflow-visible min-w-0">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6 bg-gray-50/50 rounded-t-[24px]">
            <div className="relative w-full md:flex-1 z-20">
              <Search size={20} className="absolute left-4 top-3.5 text-indigo-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                className="w-full pl-12 pr-4 py-3 text-[14px] bg-white border border-gray-200 placeholder-gray-400 focus:bg-white text-gray-900 font-medium rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                placeholder="Search Existing Customer..."
              />
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-h-60 overflow-y-auto z-50 py-2">
                  {isSearchingCustomers ? (
                    <div className="px-5 py-4 flex items-center justify-center text-indigo-500">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  ) : filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                    <div key={c.id} onMouseDown={(e) => { e.preventDefault(); handleSelectCustomer(c); }} className="px-5 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                      <p className="font-bold text-gray-800">{c.fullName}</p>
                      <p className="text-[13px] font-medium text-gray-500 mt-1">{c.phoneNumber} • {c.email}</p>
                    </div>
                  )) : <div className="px-5 py-4 text-gray-500 font-medium text-[13px] text-center">No matching customers found</div>}
                </div>
              )}
            </div>

            <div className="relative w-full md:flex-1 z-10">
              <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                onFocus={() => setShowProductDropdown(true)}
                onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                placeholder="Search by Product Name, Code..."
                className="w-full pl-12 pr-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium text-slate-800 placeholder-slate-400"
              />
              {showProductDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 py-2">
                  {isSearchingProducts ? (
                    <div className="px-5 py-4 flex items-center justify-center text-blue-500">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  ) : filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <div key={p.id} onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(p); }} className="px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{p.productname || p.name}</p>
                      </div>
                      <span className="font-black text-blue-600">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    </div>
                  )) : <div className="px-5 py-4 text-slate-500 font-medium text-[13px] text-center">No products found</div>}
                </div>
              )}
            </div>

            <div className="relative w-full md:flex-1 z-10">
              <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => { setServiceSearch(e.target.value); setShowServiceDropdown(true); }}
                onFocus={() => setShowServiceDropdown(true)}
                onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)}
                placeholder="Search by Service Name..."
                className="w-full pl-12 pr-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium text-slate-800 placeholder-slate-400"
              />
              {showServiceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 py-2">
                  {isSearchingServices ? (
                    <div className="px-5 py-4 flex items-center justify-center text-blue-500">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  ) : filteredServices.length > 0 ? filteredServices.map(s => (
                    <div key={s.id} onMouseDown={(e) => { e.preventDefault(); handleSelectService(s); }} className="px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{s.servicename}</p>
                      </div>
                      <span className="font-black text-blue-600">₹{((Number(s.servicecost) || 0) + (Number(s.serviceproductcost) || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  )) : <div className="px-5 py-4 text-slate-500 font-medium text-[13px] text-center">No services found</div>}
                </div>
              )}
            </div>
          </div>

          {selectedCustomer && (
            <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[18px] shadow-sm shrink-0">
                  {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-[15px] truncate">{selectedCustomer.fullName}</h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5 truncate">
                    {selectedCustomer.phoneNumber} {selectedCustomer.city ? `• ${selectedCustomer.city}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[13px] font-bold text-rose-600 bg-white border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-50 shadow-sm transition-all shrink-0 ml-4"
              >
                Change
              </button>
            </div>
          )}

          <div className="overflow-x-auto flex-1 relative z-0 min-w-0">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-5 py-4 w-36 text-center">Qty</th>
                  <th className="px-5 py-4 text-right">Rate</th>
                  <th className="px-5 py-4 text-center">GST</th>
                  <th className="px-6 py-4 text-right font-black text-slate-700">Amount</th>
                  <th className="px-6 py-4 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-24 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-500">No products added. Search and select products above to begin billing.</p>
                      </div>
                    </td>
                  </tr>
                ) : items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-[12px] font-semibold text-gray-500 mt-1">Code: <span className="text-gray-400">{item.code}</span> • HSN: <span className="text-gray-400">{item.hsn}</span></p>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-center border border-gray-200 rounded-xl overflow-hidden w-28 mx-auto bg-white shadow-sm">
                        <button onClick={() => handleItemChange(item.id, 'qty', (Number(item.qty) || 1) - 1)} className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors border-r border-gray-200">-</button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="w-10 text-center text-[13px] font-bold text-gray-900 py-2 focus:outline-none hide-arrows"
                        />
                        <button onClick={() => handleItemChange(item.id, 'qty', (Number(item.qty) || 0) + 1)} className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors border-l border-gray-200">+</button>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value === '' ? '' : Number(e.target.value))} className="w-24 text-right text-[14px] font-semibold text-gray-700 py-2 border border-transparent hover:border-gray-200 focus:border-indigo-500 focus:bg-white rounded-lg px-3 hide-arrows outline-none transition-all bg-transparent" />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <span className="inline-flex px-3 py-1.5 bg-gray-100 text-gray-700 font-bold text-[12px] rounded-lg">
                        {item.gst}%
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-gray-900 text-[16px]">
                      ₹{calculateItemAmount(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => handleRemove(item.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-2.5 rounded-xl hover:bg-rose-50 opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} strokeWidth={2.5} />
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
      <div className="lg:w-[420px] w-full flex flex-col gap-6 lg:self-end">
        {/* Invoice Summary */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-[28px] border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 text-white relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-[20px] font-black tracking-tight text-white">Summary</h2>
            <div className="flex bg-gray-800/80 p-1.5 rounded-xl border border-gray-700 backdrop-blur-sm">
              <button
                onClick={() => setIsGstApplied(true)}
                className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${isGstApplied ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>
                With GST
              </button>
              <button
                onClick={() => setIsGstApplied(false)}
                className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${!isGstApplied ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white'}`}>
                No GST
              </button>
            </div>
          </div>

          <div className="space-y-4 text-[15px] relative z-10">
            <div className="flex justify-between text-gray-400 font-medium">
              <span>Subtotal</span>
              <span className="text-white">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400 font-medium">
              <span>Discount Amount</span>
              <div className="flex items-center gap-1">
                <span className="text-emerald-400 font-bold">- ₹</span>
                <input
                  type="number"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(e.target.value)}
                  placeholder="0.00"
                  className="w-24 text-right bg-transparent text-emerald-400 font-bold text-[15px] outline-none border-b border-emerald-400/30 focus:border-emerald-400 hide-arrows pb-0.5"
                />
              </div>
            </div>
            <div className="flex justify-between text-white font-bold pt-4 pb-2 border-t border-gray-800">
              <span>Taxable Amount</span>
              <span>₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {isGstApplied && (
              <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 space-y-3 my-3">
                <div className="flex justify-between text-gray-400 font-semibold text-[13px]">
                  <span>CGST</span>
                  <span className="text-white">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-semibold text-[13px]">
                  <span>SGST</span>
                  <span className="text-white">₹{sgst.toFixed(2)}</span>
                </div>
                {igst > 0 && (
                  <div className="flex justify-between text-gray-400 font-semibold text-[13px]">
                    <span>IGST</span>
                    <span className="text-white">₹{igst.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between text-gray-400 font-medium pt-2">
              <span>Round Off</span>
              <span>₹{roundOff.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-700">
              <span className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Final Payable Amount</span>
              <span className="text-4xl font-extrabold text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <button onClick={handleSaveInvoice} disabled={isSavingInvoice} className="col-span-1 py-4 px-4 rounded-xl font-bold text-[15px] bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer">
            <CheckCircle2 size={20} strokeWidth={2.5} />
            {isSavingInvoice ? 'Saving...' : 'Save & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
