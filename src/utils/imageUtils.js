import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder image for fallback
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

// Cache for validated image URLs (in-memory)
const imageCache = new Map();

// Cache for image load status (persistent)
const IMAGE_CACHE_KEY = 'image_cache_status';

/**
 * Validates and fixes image URLs with aggressive optimization
 */
export const fixImageUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url.trim() === '') {
        return PLACEHOLDER_IMAGE;
    }

    // Check cache first
    if (imageCache.has(url)) {
        return imageCache.get(url);
    }

    let fixedUrl = url.trim();

    // Fix common issues
    if (fixedUrl.startsWith('//')) {
        fixedUrl = `https:${fixedUrl}`;
    }

    // Try to normalize URL while preserving useful query params (CDN resize etc.)
    try {
        const urlObj = new URL(fixedUrl);

        // Ensure HTTPS when possible
        if (urlObj.protocol === 'http:') {
            urlObj.protocol = 'https:';
        }

        // Remove common tracking params but keep CDN params
        const params = urlObj.searchParams;
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(p => params.delete(p));
        urlObj.search = params.toString();

        // Remove fragments
        urlObj.hash = '';

        fixedUrl = urlObj.toString();
    } catch (e) {
        // If URL constructor fails (malformed URL), attempt to encode and revalidate
        try {
            fixedUrl = encodeURI(fixedUrl.replace(/\s+/g, ''));
        } catch (err) {
            if (!fixedUrl.startsWith('http://') && !fixedUrl.startsWith('https://')) {
                return PLACEHOLDER_IMAGE;
            }
        }
    }

    // Validate URL is not absurdly long
    if (fixedUrl.length > 2000) {
        return PLACEHOLDER_IMAGE;
    }

    // Cache the fixed URL
    imageCache.set(url, fixedUrl);
    return fixedUrl;
};

/**
 * Fix and validate article/link URLs for WebView and external opening
 */
export const fixLinkUrl = (url) => {
    if (!url || url === 'null' || url === 'undefined' || url.trim() === '') return null;

    let fixed = url.trim();

    // Add protocol if missing
    if (!fixed.startsWith('http://') && !fixed.startsWith('https://')) {
        fixed = `https://${fixed.replace(/^:\/\//, '')}`;
    }

    // Try encoding and normalizing
    try {
        const u = new URL(fixed);
        // Remove fragment
        u.hash = '';
        return u.toString();
    } catch (e) {
        try {
            return encodeURI(fixed);
        } catch (err) {
            return null;
        }
    }
};

/**
 * Preload and cache images for better performance
 */
export const preloadImage = async (url) => {
    if (!url) return Promise.resolve();
    
    try {
        const fixedUrl = fixImageUrl(url);
        
        // Check if already cached
        const cacheStatus = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
        const cached = cacheStatus ? JSON.parse(cacheStatus) : {};
        
        if (cached[fixedUrl] === 'loaded') {
            return Promise.resolve();
        }
        
        // Try to prefetch image, with a fallback retry using encoded URI
        try {
            await Image.prefetch(fixedUrl);
        } catch (prefetchErr) {
            // Retry with encodeURI if initial prefetch fails
            try {
                const encoded = encodeURI(fixedUrl);
                await Image.prefetch(encoded);
            } catch (secondErr) {
                console.log('Image prefetch failed for (both attempts):', fixedUrl, secondErr.message || secondErr);
                // Mark as failed to avoid repeated attempts in short term
                cached[fixedUrl] = 'failed';
                await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cached));
                return Promise.resolve();
            }
        }

        // Mark as cached
        cached[fixedUrl] = 'loaded';
        await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cached));

        return Promise.resolve();
    } catch (error) {
        console.log('Image prefetch failed:', url, error.message || error);
        return Promise.resolve(); // Don't throw, just continue
    }
};

/**
 * Batch preload images (optimized)
 */
export const preloadImages = async (urls, maxConcurrent = 3) => {
    if (!urls || urls.length === 0) return Promise.resolve();
    
    // Filter valid URLs
    const validUrls = urls.filter(url => url && url !== 'null' && url !== 'undefined');
    
    // Process in batches to avoid overwhelming the network
    for (let i = 0; i < validUrls.length; i += maxConcurrent) {
        const batch = validUrls.slice(i, i + maxConcurrent);
        await Promise.allSettled(batch.map(url => preloadImage(url)));
    }
    
    return Promise.resolve();
};

/**
 * Clear image cache
 */
export const clearImageCache = async () => {
    imageCache.clear();
    await AsyncStorage.removeItem(IMAGE_CACHE_KEY);
};

/**
 * Get optimized image URL (for CDN optimization if needed)
 */
export const getOptimizedImageUrl = (url, width = 400, height = 300) => {
    const fixedUrl = fixImageUrl(url);
    
    // If using a CDN that supports image optimization, add parameters here
    // For now, return the fixed URL
    return fixedUrl;
};
