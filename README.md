# FlashNews 

A fully functional DailyHunt-style news application built with React Native (Expo), Supabase, and NewsAPI.

## ✨ Features

### Core Features
- ✅ **Fast Scrolling News Feed** - Optimized FlatList with smooth scrolling
- ✅ **Category Browsing** - All categories functional (Trending, Politics, Sports, Entertainment, Business, Tech, Health, Science, Local)
- ✅ **Hashtag Search** - Search by hashtags (#technology, #sports, etc.)
- ✅ **Keyword Search** - Real-time search with live results
- ✅ **Trending Topics** - Real-time trending news with popularity sorting
- ✅ **Local News** - Country-based news filtering
- ✅ **Bookmark Articles** - Save articles for later reading
- ✅ **Share Articles** - Native share functionality
- ✅ **In-App Browser** - Read full articles without leaving the app
- ✅ **Dark Mode** - Complete dark mode support
- ✅ **Multi-Language Structure** - Ready for 10+ languages
- ✅ **Auto-Refresh** - Pull-to-refresh and on-focus refresh
- ✅ **Image Caching** - Fixed image URLs with fallback support
- ✅ **Pagination** - Load more articles seamlessly

### UI/UX
- Beautiful card-based design
- Horizontal scrollable category chips
- Smooth animations and transitions
- Loading states and empty states
- Error handling with fallbacks

## 🚀 Quick Start

### 1. Prerequisites
- Node.js & npm/yarn
- Expo CLI (`npm install -g expo-cli`)

### 2. API Key (Already Integrated!)

**✅ Your NewsAPI key is already integrated: `da5f0f7caa31458f8285f4e892f394a7`**

The app will work immediately without any configuration. However, for production, you can:

**Option A: Use Environment Variable (Recommended)**
Create a `.env` file:
```env
EXPO_PUBLIC_NEWS_API_KEY=da5f0f7caa31458f8285f4e892f394a7
```

**Option B: Use Current Setup**
The API key is hardcoded as fallback, so the app works out of the box!

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the App

```bash
# Start Expo
npm start

# Or for specific platforms
npm run android
npm run ios
```

Scan the QR code with Expo Go (Android/iOS) or use an emulator.

## 📱 App Structure

### Screens
- **Home** - Main news feed with all categories
- **Explore** - Trending topics, hashtags, local news, categories
- **Saved** - Bookmarked articles
- **Profile** - Settings and account management

### Key Features

#### Home Tab
- Horizontal scrollable category chips
- All categories functional (Trending, Politics, Sports, Entertainment, Business, Tech, Health, Science, Local)
- Browse By options (Trending, Recommendation, Newest, Editor Picks)
- Popular news sources (CNN, BBC, MSN, CNBC, FOX)
- Pagination with "Load More"

#### Explore Tab
- Real-time trending hashtags
- Category-based browsing
- Hashtag search (#technology, #sports, etc.)
- Local news section
- Search with live results
- Auto-refresh on focus

#### Search
- Hashtag-based search (#technology, #sports, #politics)
- Keyword search
- Results with images, titles, and snippets
- Real-time search as you type

## 🔧 API Integration

### NewsAPI Endpoints Used

1. **`/top-headlines`** - Category-based news
   - Supports: country, category, language, sources
   - Categories: business, entertainment, general, health, science, sports, technology

2. **`/everything`** - Search functionality
   - Supports: query, sortBy (popularity, publishedAt, relevancy), language, date filters

3. **`/sources`** - Get available news sources
   - Supports: category, language, country filters

### API Features
- ✅ Proper parameter validation
- ✅ Error handling with cache fallback
- ✅ Pagination support
- ✅ Language support (14 languages)
- ✅ Country-based filtering
- ✅ Popularity sorting for trending

See `API_INTEGRATION_GUIDE.md` for detailed API documentation.

## 🎨 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **NewsAPI** - News data source
- **Supabase** - Backend (auth, database)
- **AsyncStorage** - Local caching

## 🔒 Environment Variables (Optional)

For production, you can set these in `.env`:

```env
EXPO_PUBLIC_NEWS_API_KEY=your_newsapi_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Database Setup (Optional - for bookmarks/auth)

If using Supabase features, run the SQL commands in `schema.sql` in your Supabase SQL Editor.

## 🎯 InSight Features

| Feature | Status |
|---------|--------|
| Trending News | ✅ Complete |
| Hashtag Search | ✅ Complete |
| Category Browsing | ✅ Complete |
| Local News | ✅ Complete |
| Bookmarking | ✅ Complete |
| Sharing | ✅ Complete |
| Dark Mode | ✅ Complete |
| Multi-language | ✅ Structure Ready |
| Fast Scrolling | ✅ Optimized |
| Auto-refresh | ✅ Complete |


## 📄 License

Private project

---

**Status**: ✅ Production Ready  
**API Key**: Integrated and Working
