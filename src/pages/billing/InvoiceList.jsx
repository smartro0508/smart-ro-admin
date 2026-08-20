import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DataTable from '../../components/DataTable';
import RightSidebar from '../../components/RightSidebar';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../utils/api.js';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const currentDate = new Date();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setIsFetching(true);
    try {
      const res = await api.post('/invoices/get-all', { fromDate, toDate });
      if (res.data?.data) {
        const formattedData = res.data.data.map((inv, index) => {
          let customerObj = inv.customerData || {};
          if (typeof customerObj === 'string') {
            try { customerObj = JSON.parse(customerObj); } catch (e) { customerObj = {}; }
          }

          return {
            ...inv,
            dbId: inv.id,
            sno: index + 1,
            id: inv.invoiceNumber,
            customer: customerObj.fullName || 'Unknown Customer',
            date: new Date(inv.invoiceDate).toLocaleDateString('en-GB'),
            amount: Number(inv.grandTotal) || 0,
            status: 'Paid', // Temporary mock
          };
        });
        setInvoices(formattedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [fromDate, toDate]);

  const handleDeleteClick = (dbId) => {
    setItemToDelete(dbId);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/invoices/delete/${itemToDelete}`);
        fetchInvoices();
      } catch (err) {
        console.error(err);
        alert('Failed to delete invoice');
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsSidebarOpen(true);
  };

  const handleDownload = async (invoice) => {
    const doc = new jsPDF();

    const imgData = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = '/app-logo.png';
    });

    // Header - Premium Corporate Look (Blue)
    doc.setFillColor(30, 58, 138); // slate-900 / blue-900 style
    doc.rect(0, 0, 210, 42, 'F');

    // Logo & Company Name
    if (imgData) {
      // Draw image at (x: 15, y: 8, width: 26, height: 26)
      doc.addImage(imgData, 'PNG', 15, 8, 26, 26);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('AURO', 45, 22);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 215, 255);
      doc.text('Water Purifier Solutions', 45, 29);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('AURO', 15, 25);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 215, 255);
      doc.text('Water Purifier Solutions', 15, 32);
    }

    // Invoice Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 195, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 215, 255);
    doc.text(`No: ${invoice.id}`, 195, 32, { align: 'right' });

    let customerData = invoice.customerData || {};
    if (typeof customerData === 'string') {
      try { customerData = JSON.parse(customerData); } catch (e) { customerData = {}; }
    }

    let items = invoice.items || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    if (!Array.isArray(items)) {
      items = [];
    }

    const subtotal = Number(invoice.subtotal) || 0;
    const cgst = Number(invoice.cgst) || 0;
    const sgst = Number(invoice.sgst) || 0;
    const igst = Number(invoice.igst) || 0;
    const totalGst = cgst + sgst + igst;
    const roundOff = Number(invoice.roundOff) || 0;
    const grandTotal = Number(invoice.grandTotal) || 0;
    const totalDiscount = Number(invoice.totalDiscount) || 0;

    // Customer & Invoice Details
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 60);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(customerData.fullName || 'Walk-in Customer', 15, 67);
    doc.text(`Phone: ${customerData.phoneNumber || 'N/A'}`, 15, 73);
    doc.text(`Email: ${customerData.email || 'N/A'}`, 15, 79);

    let yPos = 85;
    if (customerData.address) {
      doc.text(customerData.address, 15, yPos);
      yPos += 6;
    }
    if (customerData.city || customerData.state) {
      doc.text(`${customerData.city || ''} ${customerData.state || ''} - ${customerData.pincode || ''}`, 15, yPos);
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('INVOICE DETAILS:', 140, 60);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Date: ${invoice.date}`, 140, 67);
    doc.text(`Type: ${invoice.type || 'Tax Invoice'}`, 140, 73);
    doc.text(`Status: ${invoice.status}`, 140, 79);

    // Items Table
    const tableBody = items.map(item => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const discount = Number(item.discount) || 0;
      const gst = Number(item.gst) || 0;
      const base = price * qty;
      const afterDiscount = base - discount;
      const isGst = invoice.isGstApplied === true || invoice.isGstApplied === 'true' || invoice.isGstApplied === 1;
      const gstAmount = isGst ? (afterDiscount * (gst / 100)) : 0;
      const amount = afterDiscount + gstAmount;

      return [
        item.name,
        item.hsn || '-',
        qty.toString(),
        price.toFixed(2),
        `${gst}%`,
        amount.toFixed(2)
      ];
    });

    autoTable(doc, {
      startY: 105,
      head: [['Item Description', 'HSN/SAC', 'Qty', 'Rate', 'GST', 'Amount']],
      body: tableBody,
      theme: 'plain',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: { bottom: 0.1 }
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] },
      }
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 150) + 15;

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY - 5, 75, 48, 2, 2, 'F');

    let summaryY = finalY + 2;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    doc.text('Subtotal:', 125, summaryY);
    doc.text(subtotal.toFixed(2), 190, summaryY, { align: 'right' });
    summaryY += 8;

    if (totalDiscount > 0) {
      doc.text('Discount:', 125, summaryY);
      doc.text(`-${totalDiscount.toFixed(2)}`, 190, summaryY, { align: 'right' });
      summaryY += 8;
    }

    const isGstSummary = invoice.isGstApplied === true || invoice.isGstApplied === 'true' || invoice.isGstApplied === 1;
    if (isGstSummary) {
      doc.text(`Total GST:`, 125, summaryY);
      doc.text(totalGst.toFixed(2), 190, summaryY, { align: 'right' });
      summaryY += 8;
    }

    if (roundOff !== 0) {
      doc.text('Round Off:', 125, summaryY);
      doc.text(roundOff.toFixed(2), 190, summaryY, { align: 'right' });
      summaryY += 8;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Total Amount:', 125, summaryY + 5);
    doc.text(`Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, summaryY + 5, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for choosing AURO Water Purifier Solutions.', 105, 280, { align: 'center' });
    doc.text('This is a computer generated invoice and requires no signature.', 105, 285, { align: 'center' });

    doc.save(`${invoice.id}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const columns = [
    {
      header: 'S.No',
      key: 'sno',
      align: 'center'
    },
    {
      header: 'Invoice ID',
      key: 'id',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">{row.id}</span>
        </div>
      )
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (row) => <span className="font-semibold text-slate-700">{row.customer}</span>
    },
    {
      header: 'Date',
      key: 'date',
      render: (row) => <span className="text-slate-500 font-medium">{row.date}</span>
    },
    {
      header: 'Amount',
      key: 'amount',
      align: 'right',
      render: (row) => (
        <span className="font-black text-slate-900">
          ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (row) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2 transition-opacity">
          <button 
            onClick={() => handleView(row)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="View"
          >
            <Eye size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Download Invoice"
          >
            <Download size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleDeleteClick(row.dbId)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto pb-10 pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Invoice List</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Manage and track your generated invoices.</p>
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
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search by Invoice ID or Customer..."
       isLoading={isFetching} />

      {/* View Invoice Sidebar */}
      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title="Invoice Details"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">{selectedInvoice.id}</h3>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Date: {selectedInvoice.date}</p>
              <div className="mt-3 inline-block">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">Customer Details</h4>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <p className="font-bold text-slate-800">{selectedInvoice.customer}</p>
                <p className="text-[13px] text-slate-500 mt-1">
                  {(() => {
                    let cData = selectedInvoice.customerData || {};
                    if (typeof cData === 'string') try { cData = JSON.parse(cData); } catch(e) {}
                    return cData.phoneNumber || 'No phone number';
                  })()}
                </p>
                <p className="text-[13px] text-slate-500 mt-1">
                  {(() => {
                    let cData = selectedInvoice.customerData || {};
                    if (typeof cData === 'string') try { cData = JSON.parse(cData); } catch(e) {}
                    return cData.address || 'No address';
                  })()}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">Amount Summary</h4>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{Number(selectedInvoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-600 font-medium">Total GST</span>
                  <span className="text-slate-800 font-bold">₹{(Number(selectedInvoice.cgst) + Number(selectedInvoice.sgst) + Number(selectedInvoice.igst)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[16px] border-t border-blue-100/50 pt-3 mt-1">
                  <span className="text-slate-800 font-extrabold">Grand Total</span>
                  <span className="text-blue-600 font-black">₹{Number(selectedInvoice.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => { setIsSidebarOpen(false); handleDownload(selectedInvoice); }}
                className="w-full py-3 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </RightSidebar>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete this invoice? This action cannot be undone.`}
      />
    </div>
  );
};

export default InvoiceList;
