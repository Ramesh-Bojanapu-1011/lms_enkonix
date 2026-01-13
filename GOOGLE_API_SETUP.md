# Google API Setup Guide

## Get Real Google Search Results

To enable actual Google search results instead of fallback responses, you need to set up Google Custom Search API:

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Click "Create Credentials" → "API Key"
4. Copy the API key
5. Enable "Custom Search API" for your project:
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Custom Search API"
   - Click "Enable"

### Step 2: Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create a new search engine
3. In "Sites to search", enter: `*.stackoverflow.com/*` (or use "Search the entire web")
4. Give it a name like "LMS Code Search"
5. Click "Create"
6. Copy the "Search engine ID" (cx parameter)

### Step 3: Configure Environment Variables

-> Copy `.env.local.example` to `.env.local`:

```bash
   cp .env.local.example .env.local
```

-> Edit `.env.local` and add your credentials:
  
```env
   GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   GOOGLE_SEARCH_ENGINE_ID=YOUR_SEARCH_ENGINE_ID_HERE
   ```

-> Restart your Next.js development server:

```bash
   npm run dev
```

### Step 4: Test It

1. Go to the Discussions page
2. Click "Reply to this post" on any question
3. Click "Generate AI Reply"
4. You should now see real search results from Google!

## Free Tier Limits

- Google Custom Search API: **100 queries per day** (free)
- For more queries, you'll need to enable billing (~$5 per 1000 queries)

## Troubleshooting

If you get errors:

- ✅ Check that both API key and Search Engine ID are set
- ✅ Ensure Custom Search API is enabled in Google Cloud Console
- ✅ Restart your dev server after updating .env.local
- ✅ Check the browser console for error messages

## Example Search Results

The API will:

- Search Google with your question
- Extract snippets from top 5 results
- Fetch actual code from the first result
- Provide real answers, explanations, and code examples
