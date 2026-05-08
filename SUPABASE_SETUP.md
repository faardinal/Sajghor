# Supabase Integration Setup Guide

## Overview
This project has been fully integrated with Supabase for real-time database-driven product management. All product data now comes from the Supabase database, and the admin panel updates the database in real time.

## Environment Setup

### 1. Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project (or use an existing one)
4. Go to **Settings > API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`

### 2. Create Local `.env` File

In the root directory, create a `.env` file with your credentials:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

**DO NOT commit this file** - it's in `.gitignore` by default.

### 3. Create Supabase Database Tables

In your Supabase project, run this SQL in the SQL Editor:

```sql
-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  story TEXT DEFAULT '',
  material TEXT DEFAULT '',
  origin TEXT DEFAULT '',
  dimensions TEXT,
  technique TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

## Features

### ✅ Full CRUD Operations
- **GET** `/api/products` - Fetch all products
- **POST** `/api/products` - Add new product
- **PUT** `/api/products/[id]` - Update product
- **DELETE** `/api/products/[id]` - Delete product

### ✅ Real-Time Admin Panel
- Add new products with full details
- Edit existing products
- Delete products with confirmation
- Loading states while saving
- Error notifications with detailed messages
- Success feedback on operations

### ✅ Automatic Normalization
- Handles both `camelCase` and `snake_case` column names
- Converts timestamps properly
- Validates numeric fields
- Normalizes image arrays

### ✅ Error Handling
- Comprehensive API error messages
- Console logging for debugging
- User-friendly error notifications
- Proper HTTP status codes

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
3. Deploy - Vercel will use the environment variables automatically

## Development

### Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Admin Panel
Navigate to `/admin` to access the management console.

### Debugging
- Check browser console for API errors
- Check terminal for Supabase error logs
- Enable verbose logging in browser DevTools

## Troubleshooting

### "Missing environment variables" error
- ✅ Check that `.env` file exists in the root directory
- ✅ Verify variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Restart dev server after creating `.env` file

### Products not loading
- ✅ Verify `products` table exists in Supabase
- ✅ Check Supabase URL and key are correct
- ✅ Look for errors in browser console

### Can't add/edit/delete products
- ✅ Check that the products table exists
- ✅ Verify table columns match the schema above
- ✅ Check Supabase policy settings (should allow public access)

### "Row-level security policy" errors
In Supabase, disable RLS (Row-Level Security) for the products table or create proper policies:
1. Go to **Authentication > Policies** in Supabase
2. For the `products` table, enable "Enable realtime" if desired
3. Set appropriate policies (public select/insert/update/delete for admin access)

## Data Consistency

All product data from the database is normalized to match this TypeScript interface:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  story: string;
  material: string;
  origin: string;
  collectionId: string;
  createdAt: number;
  dimensions?: string;
  technique?: string;
}
```

## Production Safety

✅ No local fallback data - all data comes from Supabase
✅ Proper error handling and logging
✅ Real-time validation on form inputs
✅ Production-ready environment variable handling
✅ Secure API routes with error sanitization
✅ Works seamlessly on Vercel deployment

## Support

For issues or questions:
1. Check the error message in the admin panel
2. Look at console logs in the browser
3. Verify Supabase credentials and database schema
4. Check Vercel deployment logs if deployed
