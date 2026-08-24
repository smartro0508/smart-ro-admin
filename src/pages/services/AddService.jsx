import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api, { BASE_URL } from '../../utils/api.js';

const AddService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const textareaClass = "w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 resize-y min-h-[100px]";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const cardClass = "bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const res = await api.post(`/services/get/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            if (typeof data.keypoints === 'string') {
              try { data.keypoints = JSON.parse(data.keypoints); } catch(e) {}
            }
            setService(data);
            if (data.image) {
              setImagePreview(`${BASE_URL}/uploads/images/${data.image}`);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchService();
    }
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target);

      const keypointsRaw = e.target.keypointsInput.value.split('\n').filter(Boolean);
      formData.set('keypoints', JSON.stringify(keypointsRaw));

      const imageFile = formData.get('image');
      if (!imageFile || imageFile.size === 0 || imageFile === 'null' || imageFile === 'undefined' || imageFile === '') {
        formData.delete('image');
      }

      if (isEditMode) {
        await api.post(`/services/update/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/services/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/services');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving service');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditMode && !service) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading Service...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      <div className={`${cardClass} flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/services" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{isEditMode ? 'Edit' : 'Add New'} Service</h1>
        </div>

        <button type="submit" disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} strokeWidth={2.5} />
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Service' : 'Save Service')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Service Name</label>
                <input type="text" name="servicename" defaultValue={service?.servicename || ''} className={inputClass} placeholder="e.g. RO Installation" required />
              </div>
              
              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" defaultValue={service?.description || ''} className={`${textareaClass} min-h-[160px]`} placeholder="Detailed service description..."></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Service Cost</label>
                  <input type="number" step="0.01" name="servicecost" defaultValue={service?.servicecost || ''} className={inputClass} placeholder="e.g. 500" />
                </div>
                <div>
                  <label className={labelClass}>Product Cost</label>
                  <input type="number" step="0.01" name="serviceproductcost" defaultValue={service?.serviceproductcost || ''} className={inputClass} placeholder="e.g. 1500" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Key Points (One per line)</label>
                <textarea name="keypointsInput" defaultValue={service?.keypoints ? service.keypoints.join('\n') : ''} className={textareaClass} placeholder="e.g. 24/7 Support\nCertified Technicians"></textarea>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-6">
          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Publish Status</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={service?.status || 'active'} className={inputClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Service Image</h2>

            <div className="space-y-5">
              <div>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3" />
                {imagePreview && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
};

export default AddService;
