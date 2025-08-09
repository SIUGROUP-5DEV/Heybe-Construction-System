import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useToast } from '../contexts/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: 'admin@haype.com',
    password: 'password'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        showSuccess('Login Successful', 'Welcome to Haype Construction System!');
        navigate('/dashboard');
      } else {
        showError('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Haype Construction</h1>
            <p className="text-blue-100">Business Management System</p>
          </div>

          {/* Connection Status */}
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">🌐 Connected to Live Backend</span>
            </div>
            <p className="text-xs text-green-600 text-center mt-1">
              System is online and ready to use
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@haype.com"
              required
            />

            <div className="relative">
              <FormInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="px-8 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Email:</strong> admin@haype.com</p>
                <p><strong>Password:</strong> password</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Haype Construction. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;