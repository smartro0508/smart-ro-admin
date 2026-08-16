import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../utils/api.js';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.data.token);
        onLogin(); // Proceed to dashboard
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 bg-gray-50 overflow-hidden">
      {/* Stylish Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-400/20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[420px] z-10 relative">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-48 h-auto mb-2 drop-shadow-sm transition-transform hover:scale-105 duration-300">
            <img src="/app-logo.png" alt="AURO Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 overflow-hidden transform transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium">Please sign in to access your dashboard</p>
              {error && <p className="text-sm text-red-500 mt-3 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium hover:border-gray-300 shadow-sm"
                      placeholder="admin@auro.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[13px] font-semibold text-gray-700">Password</label>
                    <a href="#" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">Recover Password?</a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-sm font-medium hover:border-gray-300 shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] font-medium text-gray-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Platform
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50/80 backdrop-blur-md border-t border-gray-100 p-4 text-center">
            <p className="text-[12px] font-medium text-gray-500">
              Secured by AURO Enterprise Platform
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-[13px] font-medium text-gray-500 flex items-center justify-center gap-6">
          <a href="#" className="hover:text-gray-900 transition-colors duration-300">Terms of Service</a>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <a href="#" className="hover:text-gray-900 transition-colors duration-300">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <a href="#" className="hover:text-gray-900 transition-colors duration-300">Contact Help</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
