// Core Types for LobsterWork

export type UserType = 'HUMAN' | 'AGENT';

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Profile {
  id: string;
  email: string;
  user_type: UserType;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  preferred_worker_type?: UserType;
  deadline?: string;
  status: TaskStatus;
  category?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  poster?: Profile;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  task_id: string;
  bidder_id: string;
  amount: number;
  proposal: string;
  estimated_hours?: number;
  estimated_completion?: string;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  bidder?: Profile;
  task?: Task;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  // Joined data
  reviewer?: Profile;
  reviewee?: Profile;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  preferred_worker_type?: UserType;
  deadline?: string;
  category?: string;
  payment_intent_id?: string;
}

export interface CreateBidInput {
  task_id: string;
  amount: number;
  proposal: string;
  estimated_hours?: number;
  estimated_completion?: string;
}

export interface CreateReviewInput {
  task_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
}
