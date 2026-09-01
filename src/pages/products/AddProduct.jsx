import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Plus } from 'lucide-react';
import api, { BASE_URL } from '../../utils/api.js';

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const inputClass = "w-full px-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400";
  const textareaClass = "w-full px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 resize-y min-h-[100px]";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const cardClass = "bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await api.post(`/products/get/${id}`);
          if (res.data?.data) {
            const data = res.data.data;
            if (typeof data.specifications === 'string') {
              try { data.specifications = JSON.parse(data.specifications); } catch (e) { }
            }
            if (typeof data.images === 'string') {
              try { data.images = JSON.parse(data.images); } catch (e) { }
            }
            setProduct(data);
            if (data.mainImage) {
              setMainImagePreview(`${BASE_URL}/uploads/images/${data.mainImage}`);
            }
            if (data.images && data.images.length > 0) {
              setGalleryPreviews(data.images.map(img => `${BASE_URL}/uploads/images/${img}`));
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    } else {
      setMainImagePreview(null);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('You can only select up to 4 images for the gallery.');
      e.target.value = ''; // Reset input
      setGalleryPreviews([]);
      return;
    }
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target);

      const specsRaw = e.target.specsInput.value.split('\n').filter(Boolean);
      const specifications = {};
      specsRaw.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const k = line.substring(0, colonIndex).trim();
          const v = line.substring(colonIndex + 1).trim();
          if (k && v) specifications[k] = v;
        }
      });
      formData.set('specifications', JSON.stringify(specifications));

      // Handle checkbox
      formData.set('isFeatured', e.target.isFeatured.checked);

      if (formData.get('mainImage') && formData.get('mainImage').size === 0) {
        formData.delete('mainImage');
      }

      const galleryFiles = formData.getAll('images');
      if (galleryFiles.length > 0 && galleryFiles[0].size === 0) {
        formData.delete('images');
      }

      if (isEditMode) {
        await api.post(`/products/update/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/products');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creating product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditMode && !product) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading Product...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      <div className={`${cardClass} flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{isEditMode ? 'Edit' : 'Add New'} Product</h1>
        </div>

        <button type="submit" disabled={isLoading} className="py-2.5 px-6 rounded-[14px] font-bold text-[14px] bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50">
          <Save size={18} strokeWidth={2.5} />
          {isLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Save Product')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name</label>
                <input type="text" name="name" defaultValue={product?.name || ''} className={inputClass} placeholder="e.g. Smart RO Water Purifier Plus" required />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input type="text" name="slug" defaultValue={product?.slug || ''} className={inputClass} placeholder="e.g. smart-ro-water-purifier-plus" required />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Short Description</label>
                <textarea name="shortDescription" defaultValue={product?.shortDescription || ''} className={textareaClass} placeholder="Brief description for product cards..." rows={2}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Full Description</label>
                <textarea name="description" defaultValue={product?.description || ''} className={`${textareaClass} min-h-[160px]`} placeholder="Detailed product description..."></textarea>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Original Price (₹)</label>
                <input type="number" name="originalPrice" defaultValue={product?.originalPrice || ''} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Discount (%)</label>
                <input type="number" name="discount" defaultValue={product?.discount || ''} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Selling Price (₹)</label>
                <input type="number" name="price" defaultValue={product?.price || ''} className={`${inputClass} font-bold`} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Technical Specifications (Format: Key: Value)</label>
                <textarea name="specsInput" defaultValue={product?.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n') : ''} className={textareaClass} placeholder="e.g. Capacity: 10 Liters\nWeight: 8 kg"></textarea>
              </div>
              <div>
                <label className={labelClass}>Warranty Details</label>
                <input type="text" name="warranty" defaultValue={product?.warranty || ''} className={inputClass} placeholder="e.g. 1 Year Comprehensive Warranty" />
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
                <select name="status" defaultValue={product?.status || 'Active'} className={inputClass}>
                  <option value="Active">Active / Published</option>
                  <option value="Inactive">Inactive / Hidden</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="featured" name="isFeatured" defaultChecked={product?.isFeatured || false} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                <label htmlFor="featured" className="text-[14px] font-bold text-slate-700 cursor-pointer">
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-6">Product Images</h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Main Image</label>
                <input type="file" name="mainImage" accept="image/*" onChange={handleMainImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3" />
                {mainImagePreview && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                    <img src={mainImagePreview} alt="Main preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Gallery Images (Max 4)</label>
                <input type="file" name="images" multiple accept="image/*" onChange={handleGalleryChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3" />
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
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

export default AddProduct;
