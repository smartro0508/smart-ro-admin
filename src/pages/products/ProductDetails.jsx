import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Star, Edit, Trash2, CheckCircle, Tag, Settings, ShieldCheck, ListChecks } from 'lucide-react';
import api, { BASE_URL } from '../../utils/api.js';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.post(`/products/get/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.post(`/products/delete/${id}`);
        navigate('/products');
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  const cardClass = "bg-white rounded-[20px] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
  const labelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  if (isLoading) {
    return <div className="p-10 text-center font-bold text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center font-bold text-rose-500">Product not found.</div>;
  }

  const safeParseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const safeParseObject = (data) => {
    if (!data) return {};
    if (typeof data === 'object' && !Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return (typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const specifications = safeParseObject(product.specifications);
  const images = safeParseArray(product.images);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-10">
      <div className={`${cardClass} flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{product.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to={`/products/edit/${id}`} className="py-2.5 px-4 rounded-[14px] font-bold text-[14px] bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-2">
             <Edit size={18} />
             Edit Product
           </Link>
           <button onClick={handleDelete} className="py-2.5 px-4 rounded-[14px] font-bold text-[14px] bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition-all flex items-center gap-2">
             <Trash2 size={18} />
             Delete
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={cardClass}>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-[240px] flex-shrink-0">
                <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                  <img src={product.mainImage ? `${BASE_URL}/uploads/images/${product.mainImage}` : "https://via.placeholder.com/300?text=RO"} alt={product.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                      {product.status}
                    </span>
                    {product.isFeatured && (
                      <span className="inline-flex px-2.5 py-1 text-[12px] font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">{product.name}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Selling Price</p>
                    <p className="text-xl font-black text-blue-600">₹{Number(product.price).toLocaleString('en-IN')}</p>
                  </div>
                  {product.originalPrice && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Original Price</p>
                      <p className="text-lg font-bold text-slate-400 line-through">₹{Number(product.originalPrice).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">Short Description</h3>
                  <p className="text-slate-600 text-[14px] leading-relaxed">{product.shortDescription || 'No short description provided.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-6">
              <ListChecks size={20} className="text-indigo-500" />
              <h2 className="text-[16px] font-extrabold text-slate-900">Full Description</h2>
            </div>
            <div className="prose prose-slate max-w-none text-[14px]">
              <p className="whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
            </div>
          </div>


        </div>

        <div className="flex flex-col gap-6">
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Settings size={20} className="text-slate-500" />
              <h2 className="text-[16px] font-extrabold text-slate-900">Specifications</h2>
            </div>
            {specifications && Object.keys(specifications).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key}>
                    <p className={labelClass}>{key}</p>
                    <p className="font-semibold text-slate-800 text-[14px]">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-slate-500 font-medium text-center py-4">No specifications added.</p>
            )}
            
            {product.warranty && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-amber-500" />
                  <p className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Warranty Info</p>
                </div>
                <p className="font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-[14px]">{product.warranty}</p>
              </div>
            )}
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Tag size={20} className="text-slate-500" />
              <h2 className="text-[16px] font-extrabold text-slate-900">Gallery</h2>
            </div>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm">
                    <img src={`${BASE_URL}/uploads/images/${img}`} alt={`Gallery ${index}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-slate-500 font-medium text-center py-4">No gallery images.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
