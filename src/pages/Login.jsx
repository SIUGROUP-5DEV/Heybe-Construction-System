import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Building2, Eye, EyeOff, Loader2, TrendingUp, Users, BarChart3 } from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Validation Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        showSuccess('Login Successful', 'Welcome to Haype Construction!');
      } else {
        showError('Login Failed', result.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 lg:p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-white h-full flex flex-col justify-center">
                {/* Logo */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 border border-white/30">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                
                {/* Brand Name */}
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                  Haype Construction
                </h1>
                
                {/* Tagline */}
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Management System
                </p>
                
                {/* Features */}
                <div className="space-y-6">
                  <div className="flex items-center text-blue-100">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Fleet Management</h3>
                      <p className="text-blue-200 text-sm">Complete vehicle tracking and management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-100">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Customer Management</h3>
                      <p className="text-blue-200 text-sm">Invoice generation & payment tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-blue-100">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Analytics Dashboard</h3>
                      <p className="text-blue-200 text-sm">Real-time insights and reporting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to access your construction management dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="admin@haype.com"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Demo Accounts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">Administrator</p>
                      <p className="text-xs text-blue-700 mt-1">admin@haype.com</p>
                      <p className="text-xs text-blue-600">password</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-900">Manager</p>
                      <p className="text-xs text-green-700 mt-1">manager@haype.com</p>
                      <p className="text-xs text-green-600">password</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    © 2025 Haype Construction. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;