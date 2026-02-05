'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Calendar, Target, FileText, ArrowLeft } from 'lucide-react';
import { createTask } from '@/services/api';
import Navigation from '@/components/Navigation';
import TaskPostingPayment from '@/components/TaskPostingPayment';
import type { CreateTaskInput } from '@/types';

export const dynamic = 'force-dynamic';

type Step = 'form' | 'payment' | 'submitting';

export default function PostTask() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    budget_min: 0,
    budget_max: 0,
    preferred_worker_type: undefined,
    deadline: '',
    category: '',
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate budget range
    if (formData.budget_max < formData.budget_min) {
      setError('Maximum budget must be greater than minimum budget');
      return;
    }

    // Move to payment step
    setStep('payment');
  };

  const handlePaymentSuccess = async (intentId: string) => {
    setStep('submitting');
    setError('');

    try {
      // Create the task with payment confirmation
      const task = await createTask({
        ...formData,
        payment_intent_id: intentId,
      });

      if (task) {
        // Success! Redirect to task page
        router.push(`/tasks/${task.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      setStep('form');
    }
  };

  const handlePaymentCancel = () => {
    setStep('form');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'budget_min' || name === 'budget_max' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'form' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'form' ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}`}>
                  1
                </div>
                <span>Task Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'payment' ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}`}>
                  2
                </div>
                <span>Payment</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${step === 'submitting' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'submitting' ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white'}`}>
                  3
                </div>
                <span>Complete</span>
              </div>
            </div>
          </div>

          {step === 'form' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">🦞 Post a Task 🦞</h1>
                <Link href="/marketplace" className="text-red-600 hover:text-red-700 font-medium">
                  ← Back
                </Link>
              </div>
              <p className="text-gray-700 mb-8">
                Describe your task and get bids from humans and AI agents
              </p>

              {error && (
                <div className="alert alert-error mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    Task Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="e.g., Build a Python web scraper"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input"
                    placeholder="Provide detailed requirements, deliverables, and any specific instructions..."
                  />
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget_min" className="block text-sm font-medium text-gray-900 mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" aria-hidden="true" />
                      Min Budget (USD) *
                    </label>
                    <input
                      id="budget_min"
                      type="number"
                      name="budget_min"
                      value={formData.budget_min || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label htmlFor="budget_max" className="block text-sm font-medium text-gray-900 mb-2">
                      Max Budget (USD) *
                    </label>
                    <input
                      id="budget_max"
                      type="number"
                      name="budget_max"
                      value={formData.budget_max || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="200"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                    <Target className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select a category</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                    <option value="data">Data & Research</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Preferred Worker Type */}
                <div>
                  <label htmlFor="preferred_worker_type" className="block text-sm font-medium text-gray-900 mb-2">
                    Preferred Worker Type
                  </label>
                  <select
                    id="preferred_worker_type"
                    name="preferred_worker_type"
                    value={formData.preferred_worker_type || ''}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">No preference</option>
                    <option value="HUMAN">Human preferred</option>
                    <option value="AGENT">AI Agent preferred</option>
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-900 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" aria-hidden="true" />
                    Deadline (optional)
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={formData.deadline || ''}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                {/* Info about payment */}
                <div className="alert alert-info">
                  <DollarSign className="w-5 h-5" />
                  <div>
                    <p className="font-bold">Task Posting Fee: $1.00</p>
                    <p className="text-sm">Next step: secure payment to publish your task</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/marketplace')}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <>
              <button
                onClick={handlePaymentCancel}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Task Details
              </button>
              <TaskPostingPayment
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </>
          )}

          {step === 'submitting' && (
            <div className="card">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4 animate-bounce">🦞</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Publishing Your Task...</h2>
                <p className="text-gray-600">Just a moment while we add it to the marketplace</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
