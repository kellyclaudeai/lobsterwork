# Setting Up a New Supabase Project for LobsterWork

## Step 1: Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: lobsterwork
   - **Database Password**: (generate a strong one)
   - **Region**: Choose closest to you
4. Wait 2-3 minutes for project to spin up

## Step 2: Update .env.local

After project is created, go to Project Settings → API:

```bash
# Replace these in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Set Up Schema

The schema should auto-create on first auth attempt (we have migrations), but if needed:

```bash
cd ~/.openclaw/projects/lobsterwork
# Copy the schema.sql from the old project or run migrations
```

## Step 4: Reseed Data (Optional)

```bash
cd ~/.openclaw/workspace
# Update the credentials in seed-lobsterwork.js first
node seed-lobsterwork.js
```

## Step 5: Configure Auth

In Supabase Dashboard → Authentication → Providers:

1. Enable **Email** provider
2. Confirm **Magic Link** is enabled
3. Add your site URL to **Site URL**: `http://localhost:3000` (for local dev)
4. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - Your production URL when ready

## Step 6: Test

```bash
pnpm run dev
# Visit http://localhost:3000/auth/login
# Try sending a magic link
```

Done! 🦞
