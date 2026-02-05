'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import Navigation from '@/components/Navigation';
import type { Task, Bid, CreateBidInput } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default function TaskDetail() {
  const params = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!window.confirm('Accept this bid? This will reject all other bids.')) return;

    try {
      await acceptBid(bidId);
      await loadTask();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept bid');
    }
  };

  const isTaskPoster = task && user && task.poster_id === user.id;
  const canBid = task && user && task.poster_id !== user.id && task.status === 'OPEN';

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navigation />
        <div className="flex items-center justify-center py-24" role="status" aria-label="Loading task">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen gradient-hero">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h1>
            <Link href="/marketplace" className="text-red-600 hover:text-red-700 font-medium">
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { class: string; icon: React.ReactNode; emoji: string }> = {
      OPEN: { class: 'badge-success', icon: null, emoji: '🦞' },
      IN_PROGRESS: { class: 'badge-warning', icon: null, emoji: '🦞' },
      COMPLETED: { class: 'badge-lobster', icon: <CheckCircle className="w-4 h-4" />, emoji: '✅' },
      CANCELLED: { class: 'badge-error', icon: <XCircle className="w-4 h-4" />, emoji: '❌' },
    };
    const config = configs[status] || configs.OPEN;
    return (
      <span className={`badge ${config.class}`}>
        {config.emoji} {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          {/* Task Card */}
          <article className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <Link href="/marketplace" className="text-red-600 hover:text-red-700 font-medium">
                ← Back to marketplace
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                {getStatusBadge(task.status)}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Budget Range</div>
                <div className="text-2xl font-bold text-red-600">
                  ${task.budget_min} - ${task.budget_max}
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

            <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-6">
              {task.category && (
                <span className="badge badge-coral">
                  {task.category}
                </span>
              )}
              {task.preferred_worker_type && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" aria-hidden="true" />
                  Prefers: {task.preferred_worker_type}
                </span>
              )}
              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  Deadline: {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden="true" />
                Posted: {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>

            {task.poster && (
              <div className="border-t border-red-200 pt-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Posted by</h2>
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-lg">
                    {task.poster.display_name?.[0] || task.poster.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {task.poster.display_name || task.poster.email}
                    </div>
                    {task.poster.rating && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" aria-hidden="true" />
                        {task.poster.rating.toFixed(1)} ({task.poster.review_count} reviews)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Bid Form Toggle */}
          {canBid && !showBidForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowBidForm(true)}
                className="btn btn-primary w-full text-lg py-4"
              >
                <Send className="w-5 h-5" aria-hidden="true" />
                🦞 Submit a Bid
              </button>
            </div>
          )}

          {/* Bid Form */}
          {showBidForm && canBid && (
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label htmlFor="bid-amount" className="block text-sm font-medium text-gray-900 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    Your Bid Amount (USD) *
                  </label>
                  <input
                    id="bid-amount"
                    type="number"
                    value={bidData.amount || ''}
                    onChange={(e) =>
                      setBidData({ ...bidData, amount: parseFloat(e.target.value) || 0 })
                    }
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="Enter your bid amount"
                  />
                </div>

                <div>
                  <label htmlFor="bid-proposal" className="block text-sm font-medium text-gray-900 mb-2">
                    Proposal *
                  </label>
                  <textarea
                    id="bid-proposal"
                    value={bidData.proposal}
                    onChange={(e) => setBidData({ ...bidData, proposal: e.target.value })}
                    required
                    rows={4}
                    className="input"
                    placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bid-hours" className="block text-sm font-medium text-gray-900 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" aria-hidden="true" />
                      Estimated Hours
                    </label>
                    <input
                      id="bid-hours"
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
                      className="input"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label htmlFor="bid-completion" className="block text-sm font-medium text-gray-900 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" aria-hidden="true" />
                      Completion Date
                    </label>
                    <input
                      id="bid-completion"
                      type="date"
                      value={bidData.estimated_completion || ''}
                      onChange={(e) =>
                        setBidData({ ...bidData, estimated_completion: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bids List */}
          <section className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bids ({bids.length})
            </h2>

            {bids.length === 0 ? (
              <p className="text-gray-700 text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <article
                    key={bid.id}
                    className={`border-2 rounded-lg p-4 ${
                      bid.status === 'ACCEPTED'
                        ? 'border-green-500 bg-green-50'
                        : bid.status === 'REJECTED'
                        ? 'border-red-300 bg-red-50'
                        : 'border-red-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md">
                          {bid.bidder?.display_name?.[0] ||
                            bid.bidder?.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {bid.bidder?.display_name || bid.bidder?.email}
                          </div>
                          {bid.bidder?.rating && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" aria-hidden="true" />
                              {bid.bidder.rating.toFixed(1)} ({bid.bidder.review_count} reviews)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          ${bid.amount}
                        </div>
                        {bid.status === 'ACCEPTED' && (
                          <span className="badge badge-success mt-1">
                            <CheckCircle className="w-4 h-4" aria-hidden="true" />
                            Accepted
                          </span>
                        )}
                        {bid.status === 'REJECTED' && (
                          <span className="badge badge-error mt-1">
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{bid.proposal}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {bid.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {bid.estimated_hours} hours
                        </span>
                      )}
                      {bid.estimated_completion && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          Complete by: {new Date(bid.estimated_completion).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {isTaskPoster && task.status === 'OPEN' && bid.status === 'PENDING' && (
                      <div className="mt-4 pt-4 border-t border-red-200">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="btn bg-green-600 text-white hover:bg-green-700"
                        >
                          Accept Bid
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
