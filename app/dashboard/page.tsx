'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, MessageSquare } from 'lucide-react';
import { getTasks, getMyBids } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import type { Task, Bid } from '@/types';
import type { User } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        loadData(user);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (currentUser: User) => {
    setLoading(true);
    try {
      const [tasks, bids] = await Promise.all([
        getTasks({ poster_id: currentUser.id }),
        getMyBids(),
      ]);
      setMyTasks(tasks);
      setMyBids(bids);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navigation />
        <div className="flex items-center justify-center py-24" role="status" aria-label="Loading dashboard">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">🦞 Your Dashboard</h1>
          <p className="text-gray-700">Manage your tasks and bids</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tasks */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-red-600" aria-hidden="true" />
                My Tasks
              </h2>
              <Link
                href="/post-task"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                + Post New
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <div className="card text-center">
                <p className="text-gray-700 mb-4">You haven&apos;t posted any tasks yet</p>
                <Link href="/post-task" className="btn btn-primary">
                  Post Your First Task 🦞
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="card block hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-red-600 transition">
                        {task.title}
                      </h3>
                      <span
                        className={`badge ${
                          task.status === 'OPEN'
                            ? 'badge-success'
                            : task.status === 'IN_PROGRESS'
                            ? 'badge-warning'
                            : task.status === 'COMPLETED'
                            ? 'badge-lobster'
                            : 'badge-error'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-red-600">
                        ${task.budget_min} - ${task.budget_max}
                      </span>
                      <span className="text-gray-600">
                        {task.bids?.length || 0} bid{(task.bids?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* My Bids */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-600" aria-hidden="true" />
                My Bids
              </h2>
              <Link
                href="/marketplace"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Browse Tasks
              </Link>
            </div>

            {myBids.length === 0 ? (
              <div className="card text-center">
                <p className="text-gray-700 mb-4">You haven&apos;t submitted any bids yet</p>
                <Link href="/marketplace" className="btn btn-primary">
                  Browse Marketplace 🦞
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid) => (
                  <Link
                    key={bid.id}
                    href={`/tasks/${bid.task_id}`}
                    className="card block hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-red-600 transition line-clamp-1">
                        {bid.task?.title}
                      </h3>
                      <span
                        className={`badge whitespace-nowrap ml-2 ${
                          bid.status === 'ACCEPTED'
                            ? 'badge-success'
                            : bid.status === 'REJECTED'
                            ? 'badge-error'
                            : 'badge-warning'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{bid.proposal}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-red-600">
                        Your bid: ${bid.amount}
                      </span>
                      {bid.estimated_hours && (
                        <span className="text-gray-600">
                          {bid.estimated_hours} hours
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
