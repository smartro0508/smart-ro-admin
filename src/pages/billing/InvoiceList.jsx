import React, { useState } from 'react';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DataTable from '../../components/DataTable';

// Mock Data Generator
const generateInvoices = (count) => {
  const statuses = ['Paid', 'Pending', 'Overdue'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `INV-${2026000 + i}`,
    customer: `Customer ${i + 1}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('en-GB'),
    amount: Math.floor(Math.random() * 50000) + 1500,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const initialInvoices = generateInvoices(45); // Generating 45 records for pagination testing

const InvoiceList = () => {
  const [invoices] = useState(initialInvoices);

  const handleDownload = (invoice) => {
    const doc = new jsPDF();
    
    // Header - Premium Corporate Look (Blue)
    doc.setFillColor(30, 58, 138); // slate-900 / blue-900 style
    doc.rect(0, 0, 210, 42, 'F');
    
    // Logo & Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('AURO', 15, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 215, 255);
    doc.text('Water Purifier Solutions', 15, 32);
    
    // Invoice Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 195, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 215, 255);
    doc.text(`No: ${invoice.id}`, 195, 32, { align: 'right' });

    // Customer & Invoice Details
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(invoice.customer, 15, 67);
    doc.text('Phone: +91 9876543210', 15, 73);
    doc.text('GSTIN: 29ABCDE1234F1Z5', 15, 79);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('INVOICE DETAILS:', 140, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Date: ${invoice.date}`, 140, 67);
    doc.text(`Status: ${invoice.status}`, 140, 73);
    doc.text('Payment: Cash', 140, 79);

    // Items Table
    doc.autoTable({
      startY: 95,
      head: [['Item Description', 'HSN/SAC', 'Qty', 'Rate', 'GST', 'Amount']],
      body: [
        ['Premium Water Purifier System', '8421', '1', '12500.00', '18%', '12500.00'],
        ['Standard Installation Service', '9987', '1', '1500.00', '18%', '1500.00'],
      ],
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
    doc.roundedRect(120, finalY - 5, 75, 40, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', 125, finalY + 2);
    doc.text('14000.00', 190, finalY + 2, { align: 'right' });
    
    doc.text('Total GST (18%):', 125, finalY + 10);
    doc.text('2520.00', 190, finalY + 10, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Total Amount:', 125, finalY + 22);
    // Since mock data amount doesn't strictly match the static body rows above, we'll use the row's dynamic amount.
    doc.text(`Rs. ${invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 190, finalY + 22, { align: 'right' });

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
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
            <Eye size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => handleDownload(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
            title="Download Invoice"
          >
            <Download size={18} strokeWidth={2.5} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
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
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search by Invoice ID or Customer..."
      />
    </div>
  );
};

export default InvoiceList;
