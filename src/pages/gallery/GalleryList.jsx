import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, UploadCloud } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import RightSidebar from '../../components/RightSidebar';
import api, { BASE_URL } from '../../utils/api.js';

const GalleryList = () => {
  const [data, setData] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchGallery = async () => {
    try {
      const res = await api.post('/gallery/get-all');
      if (res.data?.data) {
        setData(res.data.data.map((item, index) => ({
          ...item,
          sno: index + 1,
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.post(`/gallery/delete/${itemToDelete}`);
        fetchGallery();
      } catch (err) {
        console.error(err);
        alert('Failed to delete image');
      }
      setItemToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      await api.post('/gallery/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchGallery();
      setIsSidebarOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    { key: 'sno', header: 'S.No', align: 'center' },
    {
      key: 'image',
      header: 'Image',
      render: (row) => (
        <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
          <img 
            src={`${BASE_URL}/uploads/images/${row.image}`} 
            alt="Gallery" 
            className="w-full h-full object-cover"
          />
        </div>
      )
    },
    { key: 'imageName', header: 'File Name', render: (row) => <span className="font-semibold text-slate-700">{row.image}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center">
          <button 
            onClick={() => handleDeleteClick(row.id)} 
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Gallery</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Manage images used across the application.</p>
        </div>
        <button 
          onClick={() => { setSelectedFile(null); setIsSidebarOpen(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> Add Image
        </button>
      </div>

      <DataTable columns={columns} data={data} searchPlaceholder="Search images..." />

      <RightSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        title="Upload Image"
      >
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-sm mb-4" />
                <p className="text-sm font-bold text-slate-700">{selectedFile.name}</p>
                <p className="text-[12px] text-slate-500 mt-1">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-[15px] font-bold text-slate-700 mb-1">Click to upload</h4>
                <p className="text-[13px] text-slate-500">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </RightSidebar>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </div>
  );
};

export default GalleryList;
