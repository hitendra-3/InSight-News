import AsyncStorage from '@react-native-async-storage/async-storage';
import { fixImageUrl as fixUrl } from '../utils/imageUtils';

// API Key - Use provided key as default, can be overridden via env
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || 'da5f0f7caa31458f8285f4e892f394a7';
const BASE_URL = 'https://newsapi.org/v2';

// Valid NewsAPI categories
export const VALID_CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

// Valid NewsAPI languages
export const VALID_LANGUAGES = ['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'ud', 'zh'];

// DailyHunt-style categories mapping to NewsAPI categories
export const CATEGORIES = {
    'All news': 'general',
    'Trending': 'general',
    'Politics': 'general',
    'Sports': 'sports',
    'Entertainment': 'entertainment',
    'Business': 'business',
    'Tech': 'technology',
    'Health': 'health',
    'Science': 'science',
    'Local': 'general',
};

// Hashtag to category/keyword mapping
export const HASHTAG_MAP = {
    '#technology': { category: 'technology', keyword: 'technology' },
    '#tech': { category: 'technology', keyword: 'tech' },
    '#sports': { category: 'sports', keyword: 'sports' },
    '#politics': { category: 'general', keyword: 'politics' },
    '#business': { category: 'business', keyword: 'business' },
    '#entertainment': { category: 'entertainment', keyword: 'entertainment' },
    '#health': { category: 'health', keyword: 'health' },
    '#science': { category: 'science', keyword: 'science' },
    '#bitcoin': { category: 'business', keyword: 'bitcoin cryptocurrency' },
    '#cryptocurrency': { category: 'business', keyword: 'cryptocurrency' },
    '#digitalcurrency': { category: 'business', keyword: 'digital currency' },
    '#apple': { category: 'technology', keyword: 'Apple' },
};

// Helper function to build query string
const buildQueryString = (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value);
        }
    });
    return queryParams.toString();
};

export const newsService = {
    /**
     * Fetch top headlines from NewsAPI
     * @param {string} country - Country code (e.g., 'us', 'in', 'gb')
     * @param {string} category - Category (general, business, entertainment, health, science, sports, technology)
     * @param {number} page - Page number (default: 1)
     * @param {string|null} sources - Comma-separated source IDs
     * @param {string} language - Language code (optional)
     */
    async fetchTopHeadlines(country = 'us', category = 'general', page = 1, sources = null, language = 'en') {
        try {
            // Validate category
            if (!VALID_CATEGORIES.includes(category)) {
                category = 'general';
            }

            // Validate language
            if (!VALID_LANGUAGES.includes(language)) {
                language = 'en';
            }

            let url;
            const params = {
                apiKey: API_KEY,
                page: page,
            };

            if (sources) {
                // Fetch by sources
                params.sources = sources;
                url = `${BASE_URL}/top-headlines?${buildQueryString(params)}`;
            } else {
                // Fetch by country and category
                params.country = country;
                params.category = category;
                if (language && language !== 'en') {
                    params.language = language;
                }
                url = `${BASE_URL}/top-headlines?${buildQueryString(params)}`;
            }
            
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'ok' && json.articles) {
                const articles = json.articles.map(article => ({
                    ...article,
                    summary: this.generateSummary(article),
                    urlToImage: this.fixImageUrl(article.urlToImage),
                })).filter(article => article.title && article.url); // Filter out invalid articles

                // Cache first page
                if (page === 1) {
                    const cacheKey = sources ? `last_news_${sources}` : `last_news_${category}_${country}`;
                    await AsyncStorage.setItem(cacheKey, JSON.stringify(articles));
                }

                return articles;
            } else {
                console.warn('NewsAPI response:', json.message || 'Unknown error');
                throw new Error(json.message || 'Failed to fetch news');
            }
        } catch (error) {
            console.error('News fetch error:', error);
            // Return cached data if available
            if (page === 1) {
                const cacheKey = sources ? `last_news_${sources}` : `last_news_${category}_${country}`;
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        return JSON.parse(cached);
                    } catch (e) {
                        console.error('Cache parse error:', e);
                    }
                }
            }
            return [];
        }
    },

    /**
     * Search news using /everything endpoint
     * @param {string} query - Search query or hashtag
     * @param {number} page - Page number
     * @param {string} sortBy - Sort by: popularity, publishedAt, relevancy
     * @param {string} language - Language code
     * @param {string} from - Date from (YYYY-MM-DD)
     */
    async searchNews(query, page = 1, sortBy = 'publishedAt', language = 'en', from = null) {
        try {
            // Check if query is a hashtag
            if (query.startsWith('#')) {
                const hashtagInfo = HASHTAG_MAP[query.toLowerCase()];
                if (hashtagInfo) {
                    return await this.searchByKeyword(hashtagInfo.keyword, page, sortBy, language, from);
                }
            }

            // Regular search using /everything endpoint
            const params = {
                q: query,
                sortBy: sortBy,
                page: page,
                apiKey: API_KEY,
            };

            if (language && VALID_LANGUAGES.includes(language)) {
                params.language = language;
            }

            if (from) {
                params.from = from;
            }

            const url = `${BASE_URL}/everything?${buildQueryString(params)}`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'ok' && json.articles) {
                return json.articles.map(article => ({
                    ...article,
                    summary: this.generateSummary(article),
                    urlToImage: this.fixImageUrl(article.urlToImage),
                })).filter(article => article.title && article.url);
            }
            
            console.warn('Search API response:', json.message || 'No results');
            return [];
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    /**
     * Search by keyword
     */
    async searchByKeyword(keyword, page = 1, sortBy = 'publishedAt', language = 'en', from = null) {
        return await this.searchNews(keyword, page, sortBy, language, from);
    },

    /**
     * Fetch news by category
     */
    async fetchByCategory(category, country = 'us', page = 1, language = 'en') {
        const apiCategory = CATEGORIES[category] || 'general';
        return await this.fetchTopHeadlines(country, apiCategory, page, null, language);
    },

    /**
     * Fetch local news
     */
    async fetchLocalNews(country = 'us', page = 1, language = 'en') {
        return await this.fetchTopHeadlines(country, 'general', page, null, language);
    },

    /**
     * Fetch trending news - uses popularity sort
     */
    async fetchTrending(page = 1, country = 'us', language = 'en') {
        try {
            // Fetch from multiple popular categories with popularity sort
            const categories = ['general', 'sports', 'entertainment', 'technology', 'business'];
            const allArticles = [];
            
            // Use /everything endpoint with popularity sort for better trending results
            const trendingQueries = ['news', 'breaking', 'latest', 'trending'];
            
            for (const query of trendingQueries.slice(0, 2)) { // Limit to avoid too many requests
                try {
                    const articles = await this.searchNews(query, 1, 'popularity', language);
                    allArticles.push(...articles.slice(0, 5)); // Get top 5 from each query
                } catch (e) {
                    console.error(`Trending query error for ${query}:`, e);
                }
            }

            // Also get top headlines from popular categories
            for (const cat of categories.slice(0, 3)) {
                try {
                    const articles = await this.fetchTopHeadlines(country, cat, 1, null, language);
                    allArticles.push(...articles.slice(0, 3));
                } catch (e) {
                    console.error(`Trending category error for ${cat}:`, e);
                }
            }

            // Remove duplicates and sort by trending algorithm
            const uniqueArticles = Array.from(
                new Map(allArticles.map(article => [article.url, article])).values()
            );

            return this.sortArticles(uniqueArticles, 'trending').slice(0, 20);
        } catch (error) {
            console.error('Trending fetch error:', error);
            // Fallback to general news
            return await this.fetchTopHeadlines(country, 'general', 1, null, language);
        }
    },

    /**
     * Get available news sources
     */
    async getSources(category = null, language = 'en', country = null) {
        try {
            const params = {
                apiKey: API_KEY,
            };

            if (category && VALID_CATEGORIES.includes(category)) {
                params.category = category;
            }

            if (language && VALID_LANGUAGES.includes(language)) {
                params.language = language;
            }

            if (country) {
                params.country = country;
            }

            const url = `${BASE_URL}/sources?${buildQueryString(params)}`;
            const response = await fetch(url);
            const json = await response.json();

            if (json.status === 'ok' && json.sources) {
                return json.sources;
            }
            return [];
        } catch (error) {
            console.error('Sources fetch error:', error);
            return [];
        }
    },

    /**
     * Fix broken image URLs - Use centralized imageUtils
     */
    fixImageUrl(url) {
        return fixUrl(url);
    },

    /**
     * Sort articles by different criteria
     */
    sortArticles(articles, sortBy = 'newest') {
        const sorted = [...articles];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.publishedAt || 0);
                    const dateB = new Date(b.publishedAt || 0);
                    return dateB - dateA;
                });
            case 'oldest':
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.publishedAt || 0);
                    const dateB = new Date(b.publishedAt || 0);
                    return dateA - dateB;
                });
            case 'trending':
                return sorted.sort((a, b) => {
                    // Trending score: images + title length + description length
                    const scoreA = (a.urlToImage ? 20 : 0) + (a.title?.length || 0) + (a.description?.length || 0);
                    const scoreB = (b.urlToImage ? 20 : 0) + (b.title?.length || 0) + (b.description?.length || 0);
                    return scoreB - scoreA;
                });
            case 'popularity':
                // If articles have popularity data, use it
                return sorted.sort((a, b) => {
                    // Fallback to trending algorithm if no popularity data
                    const scoreA = (a.urlToImage ? 20 : 0) + (a.title?.length || 0);
                    const scoreB = (b.urlToImage ? 20 : 0) + (b.title?.length || 0);
                    return scoreB - scoreA;
                });
            default:
                return sorted;
        }
    },

    /**
     * Generate article summary
     */
    generateSummary(article) {
        let text = article.description || article.content || '';
        if (!text) return 'No details available. Tap to read full article.';

        // Remove " [+1234 chars]" suffix common in NewsAPI
        text = text.replace(/\[\+\d+\s+chars\]$/, '');

        // Simple truncation to ~40 words
        const words = text.split(' ');
        if (words.length > 40) {
            return words.slice(0, 40).join(' ') + '...';
        }

        return text;
    },

    /**
     * Extract trending hashtags from articles
     */
    extractTrendingHashtags(articles, limit = 10) {
        const hashtagCount = {};
        
        articles.forEach(article => {
            const text = `${article.title} ${article.description || ''}`.toLowerCase();
            Object.keys(HASHTAG_MAP).forEach(hashtag => {
                const keyword = hashtag.replace('#', '');
                if (text.includes(keyword)) {
                    hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
                }
            });
        });

        return Object.entries(hashtagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([hashtag]) => hashtag);
    },
};
