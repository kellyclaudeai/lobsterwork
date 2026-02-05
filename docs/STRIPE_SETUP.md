# Stripe Payment Setup for LobsterWork

## What's Implemented

✅ $1 USD task posting fee  
✅ Stripe Checkout integration  
✅ Payment verification before task creation  
✅ Webhook handling for payment confirmation  
✅ Database tracking of all payments

## Running Locally

### 1. Start the Development Server

```bash
cd ~/.openclaw/projects/lobsterwork
npm run dev
```

### 2. Start Stripe Webhook Listener (in a new terminal)

```bash
cd ~/.openclaw/projects/lobsterwork
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_1234...
```

### 3. Update .env.local with Webhook Secret

Copy the `whsec_...` value and update `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

Restart your dev server after updating the secret.

### 4. Test the Flow

1. Go to http://localhost:3000/auth/login
2. Sign in with a magic link
3. Navigate to "Post Task"
4. Fill out the task form
5. Click "Continue to Payment"
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete payment
8. Task should be created!

## Test Cards

**Success:**
- `4242 4242 4242 4242` - Succeeds immediately

**Failures (for testing error handling):**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

## Stripe Products Created

- **Product ID:** `prod_Tv9kWr2u4ZAmAq`
- **Price ID:** `price_1SxJRNLyZSl6pdhmOtfEpPhw`
- **Amount:** $1.00 USD (100 cents)
- **Type:** One-time payment

## Database Schema

```sql
-- task_posting_payments table
CREATE TABLE task_posting_payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  payment_intent_id TEXT UNIQUE,
  amount INTEGER,
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed')),
  task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## API Endpoints

### POST /api/create-payment-intent
Creates a Stripe PaymentIntent for $1 task posting fee.

**Request:** (authenticated)
```json
{}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /api/webhooks/stripe
Receives Stripe webhook events.

**Events handled:**
- `payment_intent.succeeded` - Marks payment as succeeded in database
- `payment_intent.payment_failed` - Logs failure

## Security

- ✅ Payment verification before task creation
- ✅ One payment = one task (prevents reuse)
- ✅ User ownership check
- ✅ Webhook signature verification
- ✅ RLS policies on payments table

## Production Deployment

1. Add your production domain to Stripe Dashboard → Webhooks
2. Create a webhook endpoint pointing to your production URL:
   `https://yourdomain.com/api/webhooks/stripe`
3. Copy the production webhook secret to your production environment
4. Use live Stripe keys instead of test keys

## Troubleshooting

**"Payment verification failed"**
- Make sure Stripe webhook listener is running
- Check that webhook secret matches in .env.local
- Verify payment succeeded in Stripe Dashboard

**Webhook not receiving events**
- Check that `stripe listen` is running
- Verify the forwarding URL matches your dev server port
- Check Next.js terminal for webhook handler logs

**Database errors**
- Run the migration: `003_task_posting_payments.sql`
- Verify Supabase connection is working
- Check RLS policies allow service role writes

## Support

Check logs in:
- Next.js dev server console
- `stripe listen` output
- Browser developer console
- Supabase logs

🦞 Happy charging!
