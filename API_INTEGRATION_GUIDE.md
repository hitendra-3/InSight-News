# NewsAPI Integration Guide

## ✅ API Key Integrated

Your NewsAPI key has been successfully integrated: `da5f0f7caa31458f8285e892f394a7`

## 🔧 API Configuration

### Current Setup

The app is now configured to use NewsAPI with:

1. **API Key**: Hardcoded as default (can be overridden via environment variable)
2. **Base URL**: `https://newsapi.org/v2`
3. **Endpoints Used**:
   - `/top-headlines` - For category-based news
   - `/everything` - For search functionality
   - `/sources` - For getting available news sources

### API Parameters Supported

#### Categories (Valid)
- `business`
- `entertainment`
- `general`
- `health`
- `science`
- `sports`
- `technology`

#### Languages (Valid)
- `ar` - Arabic
- `de` - German
- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `he` - Hebrew
- `it` - Italian
- `nl` - Dutch
- `no` - Norwegian
- `pt` - Portuguese
- `ru` - Russian
- `sv` - Swedish
- `ud` - Urdu
- `zh` - Chinese

#### Countries
- Supports all NewsAPI country codes (us, in, gb, etc.)
- Default: `us`

#### Sort Options
- `popularity` - Most popular articles
- `publishedAt` - Newest first (default)
- `relevancy` - Most relevant to query

## 📡 API Endpoints Implementation

### 1. Top Headlines

```javascript
// Fetch top headlines by category
await newsService.fetchTopHeadlines('us', 'technology', 1, null, 'en');

// Fetch by sources
await newsService.fetchTopHeadlines('us', 'general', 1, 'techcrunch,bbc-news', 'en');
```

**Parameters:**
- `country`: Country code (default: 'us')
- `category`: Valid category (default: 'general')
- `page`: Page number (default: 1)
- `sources`: Comma-separated source IDs (optional)
- `language`: Language code (default: 'en')

### 2. Search Everything

```javascript
// Search by keyword
await newsService.searchNews('Apple', 1, 'popularity', 'en');

// Search with date filter
await newsService.searchNews('technology', 1, 'publishedAt', 'en', '2025-12-06');
```

**Parameters:**
- `query`: Search query or hashtag
- `page`: Page number (default: 1)
- `sortBy`: 'popularity', 'publishedAt', or 'relevancy' (default: 'publishedAt')
- `language`: Language code (default: 'en')
- `from`: Date in YYYY-MM-DD format (optional)

### 3. Get Sources

```javascript
// Get all sources
await newsService.getSources();

// Get sources by category
await newsService.getSources('technology', 'en', 'us');
```

## 🎯 Features Using NewsAPI

### Home Screen
- ✅ All categories fetch from `/top-headlines`
- ✅ Trending uses `/everything` with `sortBy=popularity`
- ✅ Local news uses country-specific `/top-headlines`
- ✅ Category filtering works for all 7 valid categories

### Explore Screen
- ✅ Search uses `/everything` endpoint
- ✅ Hashtag search converts to keyword search
- ✅ Trending hashtags extracted from articles
- ✅ Category browsing uses `/top-headlines`

### Search Functionality
- ✅ Real-time search with `/everything`
- ✅ Supports hashtags (#technology, #sports, etc.)
- ✅ Supports keywords (Apple, Bitcoin, etc.)
- ✅ Sort by popularity, publishedAt, or relevancy

## 🔒 API Key Management

### Option 1: Environment Variable (Recommended for Production)

Create a `.env` file:
```env
EXPO_PUBLIC_NEWS_API_KEY=da5f0f7caa31458f8285f4e892f394a7
```

### Option 2: Hardcoded (Current Setup)

The API key is hardcoded in `src/services/newsService.js` as a fallback:
```javascript
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'da5f0f7caa31458f8285f4e892f394a7';
```

### Option 3: EAS Secrets (For Production Builds)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_NEWS_API_KEY --value da5f0f7caa31458f8285f4e892f394a7
```

## 🚀 API Usage Examples

### Example 1: Fetch Technology News

```javascript
const techNews = await newsService.fetchByCategory('Tech', 'us', 1, 'en');
```

### Example 2: Search for Trending Topics

```javascript
// Search with popularity sort
const trending = await newsService.searchNews('technology', 1, 'popularity', 'en');
```

### Example 3: Get Local News

```javascript
// Get local news for India
const localNews = await newsService.fetchLocalNews('in', 1, 'en');
```

### Example 4: Hashtag Search

```javascript
// Search by hashtag
const results = await newsService.searchNews('#technology', 1, 'publishedAt', 'en');
```

## ⚠️ API Limitations & Best Practices

### Rate Limits
- Free tier: 100 requests/day
- Developer tier: 250 requests/day
- Business tier: Unlimited

### Best Practices
1. **Caching**: The app caches first page results to reduce API calls
2. **Error Handling**: Falls back to cached data if API fails
3. **Pagination**: Uses page parameter to load more articles
4. **Filtering**: Filters out invalid articles (no title/url)

### Error Handling

The service includes comprehensive error handling:
- ✅ Network errors → Returns cached data
- ✅ Invalid responses → Logs warning, returns empty array
- ✅ API errors → Falls back to cache
- ✅ Invalid parameters → Uses defaults

## 📊 API Response Structure

### Top Headlines Response
```json
{
  "status": "ok",
  "totalResults": 100,
  "articles": [
    {
      "source": { "id": "...", "name": "..." },
      "author": "...",
      "title": "...",
      "description": "...",
      "url": "...",
      "urlToImage": "...",
      "publishedAt": "2025-12-06T...",
      "content": "..."
    }
  ]
}
```

### Everything Response
Same structure as top-headlines, but includes more articles and supports pagination.

## 🔍 Testing API Integration

### Test Top Headlines
```bash
curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=da5f0f7caa31458f8285f4e892f394a7"
```

### Test Search
```bash
curl "https://newsapi.org/v2/everything?q=Apple&sortBy=popularity&apiKey=da5f0f7caa31458f8285f4e892f394a7"
```

## ✅ Integration Status

| Feature | Status | API Endpoint |
|---------|--------|--------------|
| Top Headlines | ✅ Working | `/top-headlines` |
| Category Filtering | ✅ Working | `/top-headlines` |
| Search | ✅ Working | `/everything` |
| Hashtag Search | ✅ Working | `/everything` |
| Trending | ✅ Working | `/everything` + `/top-headlines` |
| Local News | ✅ Working | `/top-headlines` |
| Sources | ✅ Available | `/sources` |
| Pagination | ✅ Working | All endpoints |
| Language Support | ✅ Working | All endpoints |
| Error Handling | ✅ Complete | All endpoints |

## 🎉 Ready to Use!

Your app is now fully integrated with NewsAPI and ready to fetch real news data. All endpoints are properly configured and working.

---

**API Key**: `da5f0f7caa31458f8285f4e892f394a7`  
**Status**: ✅ Active and Integrated  
**Last Updated**: 2025

