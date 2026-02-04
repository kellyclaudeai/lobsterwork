'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Star,
} from 'lucide-react';
import { getTask, createBid, acceptBid, getBidsForTask } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { Task, Bid, CreateBidInput } from '@/types';

export const dynamic = 'force-dynamic';

export default function TaskDetail() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidData, setBidData] = useState<CreateBidInput>({
    task_id: params.id as string,
    amount: 0,
    proposal: '',
    estimated_hours: undefined,
    estimated_completion: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user)).catch(() => {});
  }, []);

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadTask = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const [taskData, bidsData] = await Promise.all([
        getTask(params.id as string),
        getBidsForTask(params.id as string),
      ]);
      setTask(taskData);
      setBids(bidsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createBid(bidData);
      setShowBidForm(false);
      setBidData({
        task_id: params.id as string,
        amount: 0,
        proposal: '',
        estimated_hours: undefined,
        estimated_completion: '',
      });
      await loadTask();
    } catch (err: any) {
      setError(err.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!window.confirm('Accept this bid? This will reject all other bids.')) return;

    try {
      await acceptBid(bidId);
      await loadTask();
    } catch (err: any) {
      setError(err.message || 'Failed to accept bid');
    }
  };

  const isTaskPoster = task && user && task.poster_id === user.id;
  const canBid = task && user && task.poster_id !== user.id && task.status === 'OPEN';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <Link href="/marketplace" className="text-red-600 hover:text-red-700">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Task Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <Link href="/marketplace" className="text-red-600 hover:text-red-700">
              ← Back to marketplace
            </Link>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  task.status === 'OPEN'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'IN_PROGRESS'
                    ? 'bg-orange-100 text-orange-800'
                    : task.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {task.status === 'OPEN' && '🦞 '}
                {task.status === 'IN_PROGRESS' && '🦞 '}
                {task.status === 'COMPLETED' && '✅ '}
                {task.status === 'CANCELLED' && '❌ '}
                {task.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Budget Range</div>
              <div className="text-2xl font-bold text-red-600">
                ${task.budget_min} - ${task.budget_max}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            {task.category && (
              <div className="flex items-center">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                  {task.category}
                </span>
              </div>
            )}
            {task.preferred_worker_type && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>Prefers: {task.preferred_worker_type}</span>
              </div>
            )}
            {task.deadline && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Posted: {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          {task.poster && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Posted by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {task.poster.display_name?.[0] || task.poster.email[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {task.poster.display_name || task.poster.email}
                  </div>
                  {task.poster.rating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      {task.poster.rating.toFixed(1)} ({task.poster.review_count} reviews)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bid Form */}
        {canBid && !showBidForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              🦞 Submit a Bid
            </button>
          </div>
        )}

        {showBidForm && canBid && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Your Bid Amount (USD) *
                </label>
                <input
                  type="number"
                  value={bidData.amount || ''}
                  onChange={(e) =>
                    setBidData({ ...bidData, amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your bid amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal *
                </label>
                <textarea
                  value={bidData.proposal}
                  onChange={(e) => setBidData({ ...bidData, proposal: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    value={bidData.estimated_hours || ''}
                    onChange={(e) =>
                      setBidData({
                        ...bidData,
                        estimated_hours: parseFloat(e.target.value) || undefined,
                      })
                    }
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={bidData.estimated_completion || ''}
                    onChange={(e) =>
                      setBidData({ ...bidData, estimated_completion: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bids List */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bids ({bids.length})
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bids yet</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`border rounded-lg p-4 ${
                    bid.status === 'ACCEPTED'
                      ? 'border-green-500 bg-green-50'
                      : bid.status === 'REJECTED'
                      ? 'border-red-300 bg-red-50'
                      : 'border-orange-300 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {bid.bidder?.display_name?.[0] ||
                          bid.bidder?.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          {bid.bidder?.display_name || bid.bidder?.email}
                        </div>
                        {bid.bidder?.rating && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {bid.bidder.rating.toFixed(1)} ({bid.bidder.review_count}{' '}
                            reviews)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        ${bid.amount}
                      </div>
                      {bid.status === 'ACCEPTED' && (
                        <div className="flex items-center text-green-600 text-sm font-semibold mt-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accepted
                        </div>
                      )}
                      {bid.status === 'REJECTED' && (
                        <div className="flex items-center text-red-600 text-sm font-semibold mt-1">
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{bid.proposal}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {bid.estimated_hours && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {bid.estimated_hours} hours
                      </div>
                    )}
                    {bid.estimated_completion && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Complete by:{' '}
                        {new Date(bid.estimated_completion).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {isTaskPoster &&
                    task.status === 'OPEN' &&
                    bid.status === 'PENDING' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          Accept Bid
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
