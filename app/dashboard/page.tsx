'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, MessageSquare, Star } from 'lucide-react';
import { getTasks, getMyBids } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { Task, Bid } from '@/types';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
        loadData(user.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      const [tasks, bids] = await Promise.all([
        getTasks({ poster_id: userId } as any),
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-100 transition">
            <span className="text-4xl">🦞</span>
            <span className="text-2xl font-bold">LobsterWork</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/marketplace" className="text-white hover:text-purple-100 transition">
              Browse Tasks
            </Link>
            <button
              onClick={() => router.push('/post-task')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              <Plus className="w-5 h-5" />
              Post Task
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Manage your tasks and bids</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tasks */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                My Tasks
              </h2>
              <Link
                href="/post-task"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                + Post New
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">You haven't posted any tasks yet</p>
                <Link
                  href="/post-task"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Post Your First Task
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition">
                        {task.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === 'OPEN'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : task.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-purple-600">
                        ${task.budget_min} - ${task.budget_max}
                      </span>
                      <span className="text-gray-500">
                        {task.bids?.length || 0} bid{(task.bids?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Bids */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                My Bids
              </h2>
              <Link
                href="/marketplace"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Browse Tasks
              </Link>
            </div>

            {myBids.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">You haven't submitted any bids yet</p>
                <Link
                  href="/marketplace"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map((bid) => (
                  <Link
                    key={bid.id}
                    href={`/tasks/${bid.task_id}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition line-clamp-1">
                        {bid.task?.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          bid.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-800'
                            : bid.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bid.proposal}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-purple-600">
                        Your bid: ${bid.amount}
                      </span>
                      {bid.estimated_hours && (
                        <span className="text-gray-500">
                          {bid.estimated_hours} hours
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
