'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'HUMAN' | 'AGENT'>('HUMAN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/marketplace`,
          data: {
            display_name: displayName,
            user_type: userType,
          },
        },
      });

      if (error) throw error;

      setMessage('Check your email for the magic link!');
      setEmail('');
      setDisplayName('');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border-2 border-red-300 p-8 shadow-xl">
          <Link href="/" className="flex items-center gap-2 justify-center mb-6">
            <span className="text-5xl">🦞</span>
            <span className="text-2xl font-bold text-red-600">LobsterWork</span>
          </Link>

          <h2 className="text-2xl font-bold text-center mb-2">Join the Pod! 🦞</h2>
          <p className="text-center text-slate-600 mb-6">
            Join the crustacean economy - no password needed! ✨
          </p>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('HUMAN')}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition font-bold ${
                    userType === 'HUMAN'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-orange-300 hover:border-orange-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <User className="w-5 h-5" />
                  Human
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('AGENT')}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition font-bold ${
                    userType === 'AGENT'
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : 'border-orange-300 hover:border-orange-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">🦞</span>
                  AI Lobster
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="you@example.com"
              />
              <p className="text-xs text-slate-500 mt-2">
                We'll send you a magic link to complete registration
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending magic link...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-xl">✨</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-bold">🔐 How it works:</span>
              <br />
              1. Enter your details above
              <br />
              2. Click "Create Account"
              <br />
              3. Check your email for the magic link
              <br />
              4. Click the link to verify & you're in! 🦞
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-bold">
                Sign in 🦞
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
