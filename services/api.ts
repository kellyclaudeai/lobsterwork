import { createClient } from '@/lib/supabase/client';
import type {
  Task,
  Bid,
  Review,
  Profile,
  CreateTaskInput,
  CreateBidInput,
  CreateReviewInput,
} from '@/types';

const supabase = createClient();

// ==================== PROFILES ====================

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

// ==================== TASKS ====================

export async function getTasks(filters?: {
  status?: string;
  category?: string;
  preferred_worker_type?: string;
  poster_id?: string;
}): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      poster:profiles!tasks_poster_id_fkey(*),
      bids(id)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.preferred_worker_type) {
    query = query.eq('preferred_worker_type', filters.preferred_worker_type);
  }
  if (filters?.poster_id) {
    query = query.eq('poster_id', filters.poster_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      poster:profiles!tasks_poster_id_fkey(*),
      bids(
        *,
        bidder:profiles!bids_bidder_id_fkey(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }

  return data;
}

export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    credentials: 'same-origin',
  });

  const payload = (await res.json().catch(() => null)) as
    | { task: Task }
    | { error: string }
    | null;

  if (!res.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : 'Failed to create task';
    throw new Error(message);
  }

  if (!payload || !('task' in payload)) {
    throw new Error('Failed to create task');
  }

  return payload.task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

// ==================== BIDS ====================

export async function getBidsForTask(taskId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      bidder:profiles!bids_bidder_id_fkey(*)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }

  return data || [];
}

export async function getMyBids(): Promise<Bid[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bids')
    .select(`
      *,
      task:tasks(*),
      bidder:profiles!bids_bidder_id_fkey(*)
    `)
    .eq('bidder_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my bids:', error);
    throw error;
  }

  return data || [];
}

export async function createBid(input: CreateBidInput): Promise<Bid | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bids')
    .insert([
      {
        bidder_id: user.id,
        ...input,
        status: 'PENDING',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating bid:', error);
    throw error;
  }

  return data;
}

export async function updateBid(id: string, updates: Partial<Bid>): Promise<Bid | null> {
  const { data, error } = await supabase
    .from('bids')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating bid:', error);
    throw error;
  }

  return data;
}

export async function acceptBid(bidId: string): Promise<void> {
  // 1. Get the bid and task
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('*, task:tasks(*)')
    .eq('id', bidId)
    .single();

  if (bidError) throw bidError;

  // 2. Accept this bid
  await updateBid(bidId, { status: 'ACCEPTED' });

  // 3. Reject all other bids on this task
  const { error: rejectError } = await supabase
    .from('bids')
    .update({ status: 'REJECTED' })
    .eq('task_id', bid.task_id)
    .neq('id', bidId);

  if (rejectError) throw rejectError;

  // 4. Update task status to IN_PROGRESS
  await updateTask(bid.task_id, { status: 'IN_PROGRESS' });
}

// ==================== REVIEWS ====================

export async function createReview(input: CreateReviewInput): Promise<Review | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        reviewer_id: user.id,
        ...input,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  // Update reviewee's rating
  await updateUserRating(input.reviewee_id);

  return data;
}

async function updateUserRating(userId: string): Promise<void> {
  // Calculate average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId);

  if (!reviews || reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await supabase
    .from('profiles')
    .update({
      rating: avgRating,
      review_count: reviews.length,
    })
    .eq('id', userId);
}
