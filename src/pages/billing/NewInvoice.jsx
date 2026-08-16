import React, { useState } from 'react';
import {
  Search, Plus, Trash2, Save, Printer, CreditCard,
  User, Calendar, FileText, ChevronDown, CheckCircle2
} from 'lucide-react';

const NewInvoice = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Sample Product 1', code: 'PRD001', hsn: '8471', qty: 1, price: 1500, discount: 0, gst: 18 },
  ]);

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isGstApplied, setIsGstApplied] = useState(true);

  // Calculations
  const calculateItemAmount = (item) => {
    const base = item.price * item.qty;
    const afterDiscount = base - item.discount;
    const gstAmount = isGstApplied ? (afterDiscount * (item.gst / 100)) : 0;
    return afterDiscount + gstAmount;
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const taxableAmount = subtotal - totalDiscount;

  // Assuming intra-state for example (CGST + SGST)
  const totalGstAmount = isGstApplied ? items.reduce((sum, item) => {
    const afterDiscount = (item.price * item.qty) - item.discount;
    return sum + (afterDiscount * (item.gst / 100));
  }, 0) : 0;

  const cgst = totalGstAmount / 2;
  const sgst = totalGstAmount / 2;
  const igst = 0; // For inter-state

  const grandTotal = Math.round(taxableAmount + totalGstAmount);
  const roundOff = grandTotal - (taxableAmount + totalGstAmount);

  const balance = amountReceived ? grandTotal - Number(amountReceived) : grandTotal;

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) return;
    setItems(items.map(i => i.id === id ? { ...i, qty: parseInt(newQty) || 1 } : i));
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
                <span className="font-bold text-slate-700 tracking-wide">INV-2026-0089</span>
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
            <select className="text-[14px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option>Tax Invoice</option>
              <option>Bill of Supply</option>
            </select>
          </div>
        </div>

        {/* Customer Section */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <User size={18} strokeWidth={2.5} />
              </div>
              Customer Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-1 flex items-end">
              <button className="w-full h-[46px] bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all">
                <User size={18} strokeWidth={2.5} />
                Select Customer
              </button>
            </div>

            <div>
              <label className={labelClass}>Customer Name</label>
              <input type="text" className={inputClass} defaultValue="Walk-in Customer" />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="text" className={inputClass} placeholder="Enter Phone" />
            </div>

            <div>
              <label className={labelClass}>GST Number</label>
              <input type="text" className={inputClass} placeholder="Enter GSTIN" />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex-1 flex flex-col min-h-[350px] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-md">
              <Search size={18} className="absolute left-4 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Product Name, Code... (Alt + P)"
                className="w-full pl-11 pr-4 py-2.5 text-[14px] bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
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
                        <p>No products added. Search and add products to begin billing.</p>
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
                        <button onClick={() => handleQtyChange(item.id, item.qty - 1)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors">-</button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          className="w-10 text-center text-[13px] font-bold text-slate-800 py-1.5 border-x border-slate-200 focus:outline-none hide-arrows"
                        />
                        <button onClick={() => handleQtyChange(item.id, item.qty + 1)} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors">+</button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="number" defaultValue={item.price} className="w-20 text-right text-[14px] font-semibold text-slate-700 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-2 hide-arrows outline-none transition-all bg-transparent" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input type="number" defaultValue={item.discount} className="w-16 text-right text-[14px] font-semibold text-rose-500 py-1.5 border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded-lg px-2 hide-arrows outline-none transition-all bg-transparent" />
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
          <button className="col-span-1 py-4 px-4 rounded-[16px] font-bold text-[15px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center justify-center gap-2.5">
            <Printer size={18} strokeWidth={2.5} />
            Print
          </button>

          <button className="col-span-1 py-4 px-4 rounded-[16px] font-black text-[15px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5">
            <CheckCircle2 size={20} strokeWidth={2.5} />
            Save & Pay
          </button>
        </div>
        <div className='h-1'></div>
      </div>
    </div>
  );
};

export default NewInvoice;
