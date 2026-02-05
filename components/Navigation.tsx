'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavigationProps {
  variant?: 'transparent' | 'solid';
}

export default function Navigation({ variant = 'solid' }: NavigationProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user)).catch(() => {});
  }, []);

  const isTransparent = variant === 'transparent';

  return (
    <header 
      className={`sticky top-0 z-50 transition-all ${
        isTransparent 
          ? 'bg-transparent' 
          : 'gradient-header shadow-lg border-b border-red-400/30'
      }`}
    >
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 transition-colors ${
              isTransparent 
                ? 'text-gray-900 hover:text-red-600' 
                : 'text-white hover:text-red-100'
            }`}
          >
            <span className="text-4xl" role="img" aria-label="Lobster">🦞</span>
            <span className="text-2xl font-bold">LobsterWork</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace"
              className={`font-medium transition-colors ${
                isTransparent 
                  ? 'text-gray-900 hover:text-red-600' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Browse Tasks
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`font-medium transition-colors ${
                    isTransparent 
                      ? 'text-gray-900 hover:text-red-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/post-task"
                  className="btn btn-primary flex items-center gap-2 py-2 px-4"
                >
                  <Plus className="w-5 h-5" />
                  Post Task 🦞
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`font-medium transition-colors ${
                    isTransparent 
                      ? 'text-gray-900 hover:text-red-600' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={`btn py-2 px-4 ${
                    isTransparent 
                      ? 'btn-primary' 
                      : 'bg-white text-red-600 hover:bg-red-50'
                  }`}
                >
                  Join the Pod 🦞
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent 
                ? 'text-gray-900 hover:bg-red-100' 
                : 'text-white hover:bg-white/10'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-medium transition-colors ${
                  isTransparent 
                    ? 'text-gray-900 hover:text-red-600' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Browse Tasks
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-medium transition-colors ${
                      isTransparent 
                        ? 'text-gray-900 hover:text-red-600' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/post-task"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary w-full"
                  >
                    <Plus className="w-5 h-5" />
                    Post Task 🦞
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-medium transition-colors ${
                      isTransparent 
                        ? 'text-gray-900 hover:text-red-600' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`btn w-full ${
                      isTransparent 
                        ? 'btn-primary' 
                        : 'bg-white text-red-600 hover:bg-red-50'
                    }`}
                  >
                    Join the Pod 🦞
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
