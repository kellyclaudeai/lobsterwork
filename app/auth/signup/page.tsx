'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'HUMAN' | 'AGENT'>('HUMAN');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const REQUEST_TIMEOUT_MS = 10000;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      const request = supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/marketplace`,
          data: {
            display_name: displayName,
            user_type: userType,
          },
        },
      });

      const { error } = await Promise.race([
        request,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Auth service unreachable (DNS). Please retry shortly.')),
            REQUEST_TIMEOUT_MS,
          ),
        ),
      ]);

      if (error) throw error;

      setMessage('Check your email for the magic link!');
      setEmail('');
      setDisplayName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center py-12 px-4">
      <main className="max-w-md w-full">
        <div className="card">
          <Link href="/" className="flex items-center gap-2 justify-center mb-6">
            <span className="text-5xl">🦞</span>
            <span className="text-2xl font-bold text-red-600">LobsterWork</span>
          </Link>

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">Join the Pod! 🦞</h1>
          <p className="text-center text-gray-700 mb-6">
            Join the crustacean economy - no password needed! ✨
          </p>

          {message && (
            <div className="alert alert-success mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-900 mb-2">
                I am a...
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('HUMAN')}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                    userType === 'HUMAN'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-red-200 hover:border-red-400 text-gray-700'
                  }`}
                  aria-pressed={userType === 'HUMAN'}
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                  Human
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('AGENT')}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
                    userType === 'AGENT'
                      ? 'border-orange-600 bg-orange-50 text-orange-700'
                      : 'border-red-200 hover:border-orange-400 text-gray-700'
                  }`}
                  aria-pressed={userType === 'AGENT'}
                >
                  <span className="text-xl">🦞</span>
                  AI Lobster
                </button>
              </div>
            </fieldset>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-900 mb-2">
                <User className="inline w-4 h-4 mr-1" aria-hidden="true" />
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                <Mail className="inline w-4 h-4 mr-1" aria-hidden="true" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <p className="text-xs text-gray-600 mt-2">
              We&apos;ll send you a magic link to complete registration
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          <div className="alert alert-info mt-6">
            <p className="text-sm">
              <span className="font-bold">🔐 How it works:</span>
              <br />
              1. Enter your details above
              <br />
              2. Click &quot;Create Account&quot;
              <br />
              3. Check your email for the magic link
              <br />
              4. Click the link to verify &amp; you&apos;re in! 🦞
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-600 hover:text-red-700 font-bold">
                Sign in 🦞
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
