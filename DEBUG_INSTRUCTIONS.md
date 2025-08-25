# Debug Instructions for 500 Error

## Issue
You're getting a 500 Internal Server Error when calling the `/api/diagnostic` endpoint.

## Debug Steps

### 1. Check Environment Variables
First, test if your environment variables are properly configured:

1. Start your development server: `npm run dev`
2. Open your browser and go to: `http://localhost:3001/api/test-env`
3. Check the response to see which environment variables are set

### 2. Expected Response
You should see something like:
```json
{
  "success": true,
  "envCheck": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "VITE_SUPABASE_URL": false,
    "VITE_SUPABASE_ANON_KEY": false,
    "SUPABASE_URL": false,
    "SUPABASE_ANON_KEY": false
  },
  "actualValues": {
    "NEXT_PUBLIC_SUPABASE_URL": "SET",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "SET",
    "VITE_SUPABASE_URL": "NOT_SET",
    "VITE_SUPABASE_ANON_KEY": "NOT_SET",
    "SUPABASE_URL": "NOT_SET",
    "SUPABASE_ANON_KEY": "NOT_SET"
  }
}
```

### 3. If Environment Variables Are Missing
If the environment variables are not set, you need to create a `.env.local` file in the root of your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Add them to your `.env.local` file

### 5. Restart Development Server
After adding the environment variables:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`

### 6. Test the API Again
1. Try submitting the diagnostic form again
2. Check the browser console for detailed error messages
3. Check the terminal where you're running the dev server for server-side logs

### 7. Check Server Logs
The updated API route now includes detailed logging. Look for:
- Environment variable status
- Received data structure
- Supabase connection errors
- Database operation errors

## Common Issues

### Issue 1: Environment Variables Not Set
**Symptoms**: API returns "Server configuration error: Missing Supabase credentials"
**Solution**: Create `.env.local` file with proper Supabase credentials

### Issue 2: Invalid Supabase Credentials
**Symptoms**: API returns "Database error: [specific Supabase error]"
**Solution**: Verify your Supabase URL and anon key are correct

### Issue 3: Database Table Issues
**Symptoms**: API returns "Database error: relation 'diagnostic_campaign_leads' does not exist"
**Solution**: Ensure the table exists in your Supabase database

### Issue 4: CORS Issues
**Symptoms**: Browser console shows CORS errors
**Solution**: This shouldn't happen with Next.js API routes, but check if you're calling the correct URL

## Next Steps
After following these steps, if you're still having issues:
1. Share the response from `/api/test-env`
2. Share any error messages from the browser console
3. Share any error messages from the server terminal
