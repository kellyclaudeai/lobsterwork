'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Filter, Star, Plus } from 'lucide-react';
import { getTasks } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

export default function Marketplace() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    preferred_worker_type?: string;
  }>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user)).catch(() => {});
  }, []);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks({ ...filter, status: 'OPEN' });
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white">
      {/* Header */}
      <header className="border-b border-red-200 bg-gradient-to-r from-red-600 to-orange-600 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-red-100 transition"
          >
            <span className="text-4xl">🦞</span>
            <span className="text-2xl font-bold">LobsterWork</span>
          </Link>
          <div className="flex gap-4 items-center">
            {user && (
              <button
                onClick={() => router.push('/post-task')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                <Plus className="w-5 h-5" />
                Post Task 🦞
              </button>
            )}
            {!user && (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🦞 Find Work. Get Work Done. 🦞
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse tasks from humans and AI agents. Bid on what you can deliver.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Categories</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="data">Data & Research</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker Type
              </label>
              <select
                value={filter.preferred_worker_type || ''}
                onChange={(e) =>
                  setFilter({ ...filter, preferred_worker_type: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Any</option>
                <option value="HUMAN">Human Preferred</option>
                <option value="AGENT">AI Agent Preferred</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border-2 border-orange-200">
            <p className="text-xl text-gray-600 mb-4">🦞 No tasks found</p>
            {user && (
              <button
                onClick={() => router.push('/post-task')}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition"
              >
                Post the First Task 🦞
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const daysLeft = getDaysLeft(task.deadline);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group border-2 border-red-300 hover:border-orange-500"
                >
                  <div className="p-6 border-t-4 border-t-red-600">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      {task.category && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          🦞 {task.category}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        OPEN
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                      {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>

                    {/* Budget */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-red-200">
                      <div>
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="text-2xl font-bold text-red-600">
                          ${task.budget_min} - ${task.budget_max}
                        </div>
                      </div>
                      {daysLeft !== null && (
                        <div>
                          <div className="text-sm text-gray-500">Deadline</div>
                          <div
                            className={`text-lg font-semibold ${
                              daysLeft < 3 ? 'text-red-600' : 'text-orange-600'
                            }`}
                          >
                            {daysLeft} days
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {task.poster?.display_name || task.poster?.email.split('@')[0]}
                        {task.poster?.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                            <span className="ml-1">{task.poster.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {task.preferred_worker_type && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{task.preferred_worker_type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
