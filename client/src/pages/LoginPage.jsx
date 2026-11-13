import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleLoginSubmit = async (e, credentials = formData) => {
    if (e) e.preventDefault();
    if (!credentials.email || !credentials.password) {
      if (!validate()) return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const res = await login(credentials);
      const role = res.data?.user?.role;

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'reviewer') {
        navigate('/reviewer/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill demo credentials
  const fillDemo = (role) => {
    if (role === 'student') {
      const creds = { email: 'student@skillladder.com', password: 'Student@123' };
      setFormData(creds);
      handleLoginSubmit(null, creds);
    } else {
      const creds = { email: 'reviewer@skillladder.com', password: 'Reviewer@123' };
      setFormData(creds);
      handleLoginSubmit(null, creds);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="text-center">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 text-white items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="m4 19 8-14 8 14" />
                <path d="M7.5 13h9" />
                <path d="M6 16h12" />
                <path d="M9 10h6" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Welcome back! Continue your challenge progression.
            </p>
          </div>

          {serverError && (
            <div className="mt-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLoginSubmit(e)} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    errors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Demo Accounts (One-Click)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Student</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('reviewer')}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:border-purple-300 bg-purple-50/60 hover:bg-purple-100/50 text-purple-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Demo Reviewer</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-6 text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

