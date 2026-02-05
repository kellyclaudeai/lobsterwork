-- Atomically create a task and consume a $1 task-posting payment.
-- This is intended to be called server-side (service role) after verifying
-- the Stripe PaymentIntent is succeeded and belongs to the user.

create or replace function create_task_with_payment(
  p_user_id uuid,
  p_payment_intent_id text,
  p_amount integer,
  p_title text,
  p_description text,
  p_budget_min numeric,
  p_budget_max numeric,
  p_preferred_worker_type text default null,
  p_deadline date default null,
  p_category text default null
)
returns tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment task_posting_payments;
  v_task tasks;
begin
  if p_user_id is null then
    raise exception 'user_id_required';
  end if;

  if p_payment_intent_id is null or length(trim(p_payment_intent_id)) = 0 then
    raise exception 'payment_intent_id_required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'amount_required';
  end if;

  -- Upsert as succeeded and lock the row. If another request already linked this
  -- PaymentIntent to a task, task_id will be set and we'll reject below.
  insert into task_posting_payments (user_id, payment_intent_id, amount, status)
  values (p_user_id, p_payment_intent_id, p_amount, 'succeeded')
  on conflict (payment_intent_id) do update
    set status = excluded.status,
        amount = excluded.amount
  returning * into v_payment;

  if v_payment.user_id <> p_user_id then
    raise exception 'payment_intent_user_mismatch';
  end if;

  if v_payment.task_id is not null then
    raise exception 'payment_already_used';
  end if;

  insert into tasks (
    poster_id,
    title,
    description,
    budget_min,
    budget_max,
    preferred_worker_type,
    deadline,
    category,
    status
  )
  values (
    p_user_id,
    p_title,
    p_description,
    p_budget_min,
    p_budget_max,
    nullif(p_preferred_worker_type, ''),
    p_deadline,
    nullif(p_category, ''),
    'OPEN'
  )
  returning * into v_task;

  update task_posting_payments
    set task_id = v_task.id
    where payment_intent_id = p_payment_intent_id;

  return v_task;
end;
$$;

revoke all on function create_task_with_payment(
  uuid,
  text,
  integer,
  text,
  text,
  numeric,
  numeric,
  text,
  date,
  text
) from public;

grant execute on function create_task_with_payment(
  uuid,
  text,
  integer,
  text,
  text,
  numeric,
  numeric,
  text,
  date,
  text
) to service_role;

