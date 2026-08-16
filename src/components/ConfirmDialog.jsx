import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-[14px] text-slate-500 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-[14px] bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-[14px] bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-all"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
