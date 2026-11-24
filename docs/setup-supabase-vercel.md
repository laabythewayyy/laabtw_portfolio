# Setting up Supabase and Vercel (owner guide)

These are the steps you do yourself in your browser. They need your own sign-in, so nobody else can do them for you.
Never share your **database password** or the **secret / service_role key** with anyone. The Project URL and the publishable (anon) key are safe.

## Part A: Supabase account and project ✅ (already done)

1. Sign up at supabase.com with **Continue with GitHub**.
2. Create the organization **laabytheway** (Personal, Free).
3. Create the project with these settings:
   - Data API: **on**
   - Grant API access to new tables automatically: **on**
   - Enable RLS on new tables automatically: **on**

   The region is Seoul, which is fine.
4. **Authentication → Sign In / Providers →** turn **off** "Allow new users to sign up" → **Save changes**.
5. **Authentication → Users → Add user → Create new user:** enter your email and a dashboard password, tick **Auto Confirm User**, then **Create user**.

## Part B: Connect your computer to Supabase

1. In the project folder, make a copy of the file `.env.example` and name the copy **`.env.local`**.
2. Open `.env.local` in VS Code and replace the three example values:

   | Line | Where to find the value in Supabase |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | **Project Overview**: the `https://….supabase.co` address at the top (use its **Copy** button) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings** (⚙️ bottom left) **→ API Keys → Publishable key** (starts with `sb_publishable_`). If you only see "anon public", use that. |
   | `ADMIN_USER_ID` | **Authentication → Users →** click your email **→ User UID** |

3. Save the file. Never upload this file anywhere. It is already excluded from GitHub.

## Part C: Create the database tables

1. In Supabase, open **SQL Editor** in the left menu.
2. Click **+ New query**.
3. In VS Code, open `supabase/schema.sql`, select everything (Ctrl+A), copy it, paste it into the SQL editor, and click **Run**. You should see "Success. No rows returned".
4. Do the same, in this order, for `supabase/policies.sql`, then `supabase/storage.sql`, then `supabase/seed.sql`.
5. Make yourself the admin. Paste this in a new query, put your User UID between the quotes, and click **Run**:

   ```sql
   insert into admins (user_id) values ('PASTE-YOUR-USER-UID-HERE');
   ```

## Part D: Vercel (putting the site online, at the very end)

1. Sign up at vercel.com with **Continue with GitHub**.
2. **Add New → Project →** import the repository **laabythewayyy/portfolio**.
3. Before clicking Deploy, open **Environment Variables** and add the same three lines from your `.env.local` (name and value).
4. Click **Deploy**. Every later push to GitHub updates the site automatically.
