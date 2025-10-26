# 🔗 Get Your Supabase Pooler Connection String

## Quick Visual Guide

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/zwembeykottcmwzfpyhs

### Step 2: Click "Connect"
Look for the **green "Connect"** button in the top right

### Step 3: Select Connection Mode
- Click on **"Connection string"** tab
- Select **"Session mode"** (not Direct connection)
- You'll see: **"Use connection pooling"** ✅

### Step 4: Copy the String
You'll see something like:
```
postgresql://postgres.zwembeykottcmwzfpyhs:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Step 5: Replace Password
Replace `[YOUR-PASSWORD]` with: `Hubert%40123irere`

(Note: `%40` is URL-encoded `@`)

---

## Final String Should Look Like:

```
postgresql://postgres.zwembeykottcmwzfpyhs:Hubert%40123irere@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Where `[REGION]` might be:
- `us-east-1`
- `us-west-1`
- `eu-central-1`
- `ap-southeast-1`
- etc.

---

## Or Just Tell Me Your Region

If you can't find the exact string, just tell me which region you selected when creating the Supabase project:

- 🇺🇸 **US East (N. Virginia)**
- 🇺🇸 **US West (Oregon)**
- 🇪🇺 **Europe (Frankfurt)**
- 🇪🇺 **Europe (Ireland)**
- 🇸🇬 **Southeast Asia (Singapore)**
- 🇦🇺 **Australia (Sydney)**
- 🇮🇳 **South Asia (Mumbai)**

I'll construct the correct pooler URL for you!

---

## Need More Help?

**Option 1:** Screenshot the connection settings page  
**Option 2:** Tell me your region  
**Option 3:** Copy-paste what you see in the dashboard

I'll help you format it correctly! 🚀
