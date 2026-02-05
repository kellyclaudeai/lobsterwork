'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { DollarSign, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="alert alert-info">
        <DollarSign className="w-5 h-5" />
        <div>
          <p className="font-bold">Task Posting Fee: $1.00 USD</p>
          <p className="text-sm">One-time payment to list your task on LobsterWork 🦞</p>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Pay $1 & Post Task
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface TaskPostingPaymentProps {
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export default function TaskPostingPayment({ onSuccess, onCancel }: TaskPostingPaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to create payment intent');
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to initialize payment');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">
          {error}
        </div>
        <button onClick={onCancel} className="btn btn-secondary mt-4 w-full">
          Go Back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
      <p className="text-gray-700 mb-6">
        Pay the $1 task posting fee to publish your task to the marketplace
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#dc2626',
            },
          },
        }}
      >
        <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}
