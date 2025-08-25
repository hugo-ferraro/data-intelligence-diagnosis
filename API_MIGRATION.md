# API Migration Documentation

## Overview
This project has been migrated from direct Supabase calls in the frontend to using Next.js API routes for better security and architecture.

## Changes Made

### 1. Created API Route
- **File**: `src/app/api/diagnostic/route.ts`
- **Purpose**: Handles all Supabase operations for diagnostic data
- **Endpoints**:
  - `POST /api/diagnostic` - Save diagnostic data
  - `GET /api/diagnostic?id={id}` - Retrieve diagnostic data

### 2. Updated Diagnostic Service
- **File**: `src/lib/services/diagnostic-service.ts`
- **Changes**:
  - Removed direct Supabase import
  - Updated `saveDiagnosticData()` to use fetch API
  - Updated `getDiagnosticData()` to use fetch API
  - Added proper error handling for API responses

### 3. Updated Database Configuration
- **File**: `src/lib/database/index.ts`
- **Changes**:
  - Added support for both Next.js (`NEXT_PUBLIC_*`) and Vite (`VITE_*`) environment variables
  - Maintains backward compatibility

## Environment Variables

The following environment variables are required:

```env
# Next.js style (recommended)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Vite style (for backward compatibility)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Benefits

1. **Security**: Supabase credentials are no longer exposed in the frontend
2. **Architecture**: Cleaner separation between frontend and backend logic
3. **Error Handling**: Centralized error handling in API routes
4. **Scalability**: Easier to add middleware, validation, and logging

## Usage

The frontend code remains unchanged. The `saveDiagnosticData()` and `getDiagnosticData()` functions work exactly the same way, but now they communicate through the API route instead of directly with Supabase.

## Testing

To test the API routes:

1. Start the development server: `npm run dev`
2. The API endpoints will be available at:
   - `http://localhost:3000/api/diagnostic` (POST)
   - `http://localhost:3000/api/diagnostic?id=1` (GET)
