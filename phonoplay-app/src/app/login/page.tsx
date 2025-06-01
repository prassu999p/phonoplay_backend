'use client';
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-pink-50 w-1/2 p-12">
        <div className="max-w-xs">
          <div className="text-3xl font-bold text-pink-600 mb-2 flex items-center gap-2">
            PhonicsPlay <span className="text-xl">🎯</span>
          </div>
          <div className="text-lg font-semibold text-pink-500 mb-1">
            Where letters come alive! <span className="text-yellow-400">✨</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Join thousands of kids on their reading adventure
          </div>
        </div>
      </div>
      {/* Right: Login Form */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md p-8">
          {/* Tabs */}
          <div className="flex justify-center mb-8 gap-2">
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'login' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setTab('login')}
            >
              Login
            </button>
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'signup' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-400'}`}
              onClick={() => setTab('signup')}
            >
              Sign Up
            </button>
          </div>
          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center bg-gray-100 rounded-full px-3">
                <span className="text-gray-400 mr-2">📧</span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none py-2 text-gray-700 text-base"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center bg-gray-100 rounded-full px-3">
                <span className="text-gray-400 mr-2">🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent outline-none py-2 text-gray-700 text-base"
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mt-2">{error}</div>
            )}
            <button
              type="submit"
              className="mt-2 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg rounded-full py-3 transition-colors shadow disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span>Loading...</span>
              ) : tab === 'login' ? (
                <span className="flex items-center justify-center gap-2">→ Let&apos;s Begin! <span>🐣</span></span>
              ) : (
                <span className="flex items-center justify-center gap-2">Sign Up <span>📝</span></span>
              )}
            </button>
          </form>
          {/* Help Link */}
          <div className="mt-8 text-center">
            <div className="text-xs text-gray-500 mb-1">Parents &amp; Teachers</div>
            <a href="#help" className="text-pink-500 hover:underline text-sm flex items-center justify-center gap-1">
              <span className="text-lg">❓</span> Need help?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
