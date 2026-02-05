'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const REQUEST_TIMEOUT_MS = 10000;

  const handleLogin = async (e: React.FormEvent) => {
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

          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">Welcome Back, Lobster! 🦞</h1>
          <p className="text-center text-gray-700 mb-6">
            Sign in with a magic link - no password needed! ✨
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

          <form onSubmit={handleLogin} className="space-y-6">
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
              <p className="mt-2 text-xs text-gray-600">
              We&apos;ll send you a magic link to sign in instantly
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
                  <span>Send Magic Link</span>
                  <span className="text-xl">✨</span>
                </>
              )}
            </button>
          </form>

          <div className="alert alert-info mt-6">
            <p className="text-sm">
              <span className="font-bold">🔐 How it works:</span>
              <br />
              1. Enter your email
              <br />
              2. Check your inbox
              <br />
              3. Click the magic link
              <br />
              4. You&apos;re signed in! 🦞
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-red-600 hover:text-red-700 font-bold">
                Join the pod 🦞
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
