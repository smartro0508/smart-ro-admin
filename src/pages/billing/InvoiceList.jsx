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
  const [selectedType, setSelectedType] = useState('All');

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
          while (typeof customerObj === 'string') {
            try {
              const parsed = JSON.parse(customerObj);
              if (typeof parsed !== 'object' || parsed === null) break;
              customerObj = parsed;
            } catch (e) {
              break;
            }
          }
          if (Array.isArray(customerObj) && customerObj.length > 0) {
            customerObj = customerObj[0];
          }

          return {
            ...inv,
            customerData: customerObj,
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

    // Load logo, signature, and smartro images
    const [logoImg, sigImg, smartroImg] = await Promise.all([
      new Promise((resolve) => {
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
      }),
      new Promise((resolve) => {
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
        img.src = '/signature.png';
      }),
      new Promise((resolve) => {
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
        img.src = '/smartro.png';
      })
    ]);

    // Colors
    const darkBlue = [35, 46, 60];
    const lightBlue = [75, 154, 217];

    // 1. Top Left Logo
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 15, 15, 45, 15);
    } else {
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AURO Water Purifier', 15, 25);
    }

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('9/1,sri nagar,deepam nagar 9th Street, irugur,641103', 15, 36);
    doc.text('Ph: 6383450508, 9790188321', 15, 41);

    const isGstApplied = invoice.isGstApplied === true || invoice.isGstApplied === 'true' || invoice.isGstApplied === 1;

    // 2. Top Right "INVOICE"
    doc.setTextColor(...lightBlue);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(isGstApplied ? 'TAX INVOICE' : 'INVOICE', 195, 30, { align: 'right' });

    if (isGstApplied) {
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('GSTIN: 33JXVPS7863A1ZQ', 195, 38, { align: 'right' });
    }

    // Extract data
    let customerData = invoice.customerData || {};
    while (typeof customerData === 'string') {
      try {
        const parsed = JSON.parse(customerData);
        if (typeof parsed !== 'object' || parsed === null) break;
        customerData = parsed;
      } catch (e) {
        break;
      }
    }
    if (Array.isArray(customerData) && customerData.length > 0) {
      customerData = customerData[0];
    }

    let items = invoice.items || [];
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch (e) { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    const subtotal = Number(invoice.subtotal) || 0;
    const cgst = Number(invoice.cgst) || 0;
    const sgst = Number(invoice.sgst) || 0;
    const igst = Number(invoice.igst) || 0;
    const totalGst = cgst + sgst + igst;
    const grandTotal = Number(invoice.grandTotal) || 0;
    const totalDiscount = Number(invoice.totalDiscount) || 0;

    // 3. Billing Info (Left side)
    let yPos = 60;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Billing to:', 15, yPos);

    yPos += 5;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(customerData.fullName || invoice.customer || 'Client Name', 15, yPos);

    yPos += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 80, yPos); // underline

    yPos += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    if (customerData.phoneNumber) {
      doc.text(`${customerData.phoneNumber}`, 15, yPos);
      yPos += 5;
    }
    if (customerData.email) {
      doc.text(`${customerData.email}`, 15, yPos);
      yPos += 5;
    }

    let fullAddr = customerData.address || '';
    if (customerData.city) fullAddr += (fullAddr ? `, ${customerData.city}` : customerData.city);
    if (customerData.state) fullAddr += (fullAddr ? `, ${customerData.state}` : customerData.state);
    if (customerData.pincode) fullAddr += (fullAddr ? ` - ${customerData.pincode}` : customerData.pincode);

    if (fullAddr) {
      const splitAddr = doc.splitTextToSize(`${fullAddr}`, 80);
      doc.text(splitAddr, 15, yPos);
    }

    // 4. Invoice Details (Right side)
    yPos = 65;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Invoice No', 130, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${invoice.id}`, 155, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 130, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${invoice.date}`, 155, yPos);

    yPos += 12;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`DUE- Rs.${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 195, yPos, { align: 'right' });

    // 5. Items Table
    const tableBody = items.map((item, idx) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const gst = Number(item.gst) || 0;
      const base = price * qty;
      const gstAmount = isGstApplied ? (base * (gst / 100)) : 0;
      const amount = base + gstAmount;

      let itemName = item.name || '';
      if (item.description) {
        itemName += `\n${item.description}`;
      } else if (item.product?.description) {
        itemName += `\n${item.product.description}`;
      }

      return [
        (idx + 1).toString().padStart(2, '0'),
        itemName.toLowerCase(),
        `Rs.${price.toFixed(2)}`,
        qty.toString(),
        `Rs.${amount.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 105,
      head: [['P-ID', 'ITEM DESCRIPTION', 'UNIT', 'QUANTITY', 'TOTAL']],
      body: tableBody,
      theme: 'plain',
      headStyles: {
        fillColor: lightBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [50, 50, 50],
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'left' }
      },
      alternateRowStyles: {
        fillColor: [248, 248, 250]
      }
    });

    let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 150) + 10;

    // 6. Totals section
    doc.setFontSize(9);

    doc.setFont('helvetica', 'normal');
    doc.text('SUB TOTAL -', 150, finalY, { align: 'right' });
    doc.text(`Rs.${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
    finalY += 6;

    if (isGstApplied && totalGst > 0) {
      doc.setDrawColor(230, 230, 230);
      doc.line(110, finalY - 4, 195, finalY - 4);
      doc.text(`GST - `, 150, finalY, { align: 'right' });
      doc.text(`Rs.${totalGst.toFixed(2)}`, 190, finalY, { align: 'right' });
      finalY += 6;
    }

    if (totalDiscount > 0) {
      doc.line(110, finalY - 4, 195, finalY - 4);
      doc.setTextColor(34, 197, 94); // Green color
      doc.text(`DISCOUNT -`, 150, finalY, { align: 'right' });
      doc.text(`Rs.${totalDiscount.toFixed(2)}`, 190, finalY, { align: 'right' });
      doc.setTextColor(50, 50, 50);
      finalY += 6;
    }

    doc.setFillColor(...darkBlue);
    doc.rect(100, finalY - 4, 95, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL -', 150, finalY + 2.5, { align: 'right' });
    doc.text(`Rs.${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, finalY + 2.5, { align: 'right' });

    // Number to words converter
    const numberToWords = (num) => {
      const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'overflow';
        let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return;
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
        return str.trim() === '' ? 'Zero' : str.trim() + ' Only';
      }
      return inWords(Math.round(num));
    };

    // Add Total In Words
    let notesY = finalY + 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...lightBlue);
    doc.text('Total In Words Indian Rupee', 15, notesY);

    doc.setTextColor(50, 50, 50);
    const amountInWords = numberToWords(grandTotal);
    doc.text(`${amountInWords}`, 15, notesY + 5);

    // Notes
    notesY += 15;
    doc.setTextColor(...lightBlue);
    doc.text('Notes', 15, notesY);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('Thanks for your business.', 15, notesY + 5);

    // Terms & Conditions
    notesY += 15;
    doc.setTextColor(...lightBlue);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', 15, notesY);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    const splitTerms = doc.splitTextToSize(invoice.termsnotes || 'one year warranty', 100);
    doc.text(splitTerms, 15, notesY + 5);

    let bottomY = notesY + 20;
    if (bottomY > 230) bottomY = 230;

    // LEFT SIDE
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(8);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...lightBlue);
    doc.text('PAYMENT METHOD :', 15, bottomY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(` ${invoice.paymentmethod || 'UPI'}`, 45, bottomY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...lightBlue);
    doc.text('PAYMENT STATUS :', 15, bottomY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(` ${(invoice.paymentstatus || 'PAID').toUpperCase()}`, 45, bottomY + 6);

    // RIGHT SIDE (Signature & Seal)
    if (sigImg) {
      doc.addImage(sigImg, 'PNG', 125, bottomY - 5, 35, 15);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(20);
      doc.setTextColor(30, 30, 30);
      doc.text('Authorized', 125, bottomY + 10);
    }

    if (smartroImg) {
      // 125 + 25 = 150 (tucked slightly into signature)
      doc.addImage(smartroImg, 'PNG', 150, bottomY - 10, 25, 25);
    }

    doc.setDrawColor(30, 30, 30);
    doc.line(120, bottomY + 15, 185, bottomY + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text('Thank you for choosing our business', 120, bottomY + 20);



    // 9. Footer Band
    doc.setFillColor(...lightBlue);
    doc.rect(15, 262, 180, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Thank you for contacting us! Our services:', 20, 267);

    doc.setFont('helvetica', 'normal');
    const servicesText = 'Multi services & sales available : Building construction,water level controller,Ac,water purifier,fridge, washing machine, dish washer,cctv, UPS, solar power system, stabilizer, chimney,water heater,solar heater, plumbing, electrical, house cleaning ,home shifting, fabrication, automation, Lightings, Smart switches, Painting works,generators,Ro plants, softener etc...';
    const splitServices = doc.splitTextToSize(servicesText, 170);
    doc.text(splitServices, 20, 272);

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

  const filteredInvoices = invoices.filter(inv => {
    if (selectedType === 'All') return true;
    const isGst = inv.isGstApplied === true || inv.isGstApplied === 'true' || inv.isGstApplied === 1;
    if (selectedType === 'GST') return isGst;
    if (selectedType === 'Non-GST') return !isGst;
    return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-10 pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Invoice List</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Manage and track your generated invoices.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['All', 'GST', 'Non-GST'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${selectedType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {type}
              </button>
            ))}
          </div>

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
        data={filteredInvoices}
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
                    if (typeof cData === 'string') try { cData = JSON.parse(cData); } catch (e) { }
                    return cData.phoneNumber || 'No phone number';
                  })()}
                </p>
                <p className="text-[13px] text-slate-500 mt-1">
                  {(() => {
                    let cData = selectedInvoice.customerData || {};
                    if (typeof cData === 'string') try { cData = JSON.parse(cData); } catch (e) { }
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
