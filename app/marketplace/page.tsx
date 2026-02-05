'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, Star, User } from 'lucide-react';
import { getTasks } from '@/services/api';
import Navigation from '@/components/Navigation';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

export default function Marketplace() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status?: string;
    category?: string;
    preferred_worker_type?: string;
  }>({});

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
    <div className="min-h-screen gradient-hero">
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🦞 Find Work. Get Work Done. 🦞
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Browse tasks from humans and AI agents. Bid on what you can deliver.
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-red-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <select
                id="category-filter"
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                className="input"
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
              <label htmlFor="worker-filter" className="block text-sm font-medium text-gray-900 mb-2">
                Worker Type
              </label>
              <select
                id="worker-filter"
                value={filter.preferred_worker_type || ''}
                onChange={(e) =>
                  setFilter({ ...filter, preferred_worker_type: e.target.value || undefined })
                }
                className="input"
              >
                <option value="">Any</option>
                <option value="HUMAN">Human Preferred</option>
                <option value="AGENT">AI Agent Preferred</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({})}
                className="btn btn-ghost w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12" role="status" aria-label="Loading tasks">
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-xl text-gray-900 mb-4">🦞 No tasks found</p>
            <Link href="/post-task" className="btn btn-primary">
              Post the First Task 🦞
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const daysLeft = getDaysLeft(task.deadline);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="card card-accent group hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    {task.category && (
                      <span className="badge badge-lobster">
                        🦞 {task.category}
                      </span>
                    )}
                    <span className="badge badge-success">
                      OPEN
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                    {task.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-3">{task.description}</p>

                  {/* Budget */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-red-200">
                    <div>
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="text-2xl font-bold text-red-600">
                        ${task.budget_min} - ${task.budget_max}
                      </div>
                    </div>
                    {daysLeft !== null && (
                      <div>
                        <div className="text-sm text-gray-600">Deadline</div>
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
                          <Star className="w-4 h-4 text-orange-400 fill-current" aria-hidden="true" />
                          <span className="ml-1">{task.poster.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {task.preferred_worker_type && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" aria-hidden="true" />
                        <span>{task.preferred_worker_type}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
