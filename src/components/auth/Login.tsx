import React, { useState } from 'react';
import { Lock, User, Wifi, WifiOff, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

type AuthMode = 'signin' | 'signup' | 'offline';

export const Login: React.FC = () => {
  const { signIn, signUp, loginAsGuest, isLoading, error, clearError, isSupabaseConnected } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!formData.username) {
      return;
    }
    await signIn({
      username: formData.username,
      password: formData.password,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!formData.username) {
      return;
    }
    await signUp({
      username: formData.username,
      password: formData.password
    });
  };

  const handleGuestLogin = () => {
    clearError();
    loginAsGuest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Clock Me</h1>
          <p className="text-slate-400">Time tracking and task management</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          {isSupabaseConnected ? (
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
              <Wifi size={16} />
              Connected to cloud
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
              <WifiOff size={16} />
              Offline mode available
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Auth Forms */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 mb-6">
          {/* Mode Tabs */}
          {isSupabaseConnected && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setMode('signin');
                  clearError();
                }}
                className={cn(
                  'flex-1 py-2 px-3 rounded text-sm font-medium transition-all',
                  mode === 'signin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  clearError();
                }}
                className={cn(
                  'flex-1 py-2 px-3 rounded text-sm font-medium transition-all',
                  mode === 'signup'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="your-username"
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.username}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded transition-all"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="choose-a-username"
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.username}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded transition-all"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Offline Mode Notice */}
          {!isSupabaseConnected && (
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-4">
                Supabase is not available. Continue in offline mode to use the app with local storage.
              </p>
            </div>
          )}
        </div>

        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-200 font-medium rounded border border-slate-600 transition-all mb-4"
        >
          {isLoading ? 'Loading...' : 'Continue as Guest'}
        </button>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>All your tasks are stored locally and optionally synced to the cloud.</p>
        </div>
      </div>
    </div>
  );
};
