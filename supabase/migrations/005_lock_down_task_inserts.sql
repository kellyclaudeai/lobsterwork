-- Prevent client-side direct inserts into `tasks`.
-- Task creation should only happen through the server-side flow that verifies
-- Stripe payment + consumes `task_posting_payments` via RPC.

revoke insert on table tasks from anon, authenticated;

