# Supabase Setup Verification

This guide will help you verify your Supabase tables are set up correctly.

## Step 1: Check if Tables Exist

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `gqtvyifqnkvmvcubytzn`
3. Go to **Table Editor** (left sidebar)
4. Verify these tables exist:
   - ✅ `workspaces`
   - ✅ `projects`
   - ✅ `tasks`

**If tables are missing**, run the schema:
1. Go to **SQL Editor**
2. Copy contents from `database.sql`
3. Click **Run**

## Step 2: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Verify each table has a policy called "Allow all operations on [table]"
3. If missing, run the RLS section from `database.sql`

## Step 4: Test API Connection

Open browser console and check for detailed error message. The API route now returns:
- `error`: Error message
- `details`: Additional error details
- `hint`: Supabase hint for fixing the issue
- `code`: Error code

Common issues:
- **"relation does not exist"** → Tables not created, run schema
- **"new row violates row-level security"** → RLS policies not set
- **Connection error** → Check environment variables in `.env.local`
