import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { fixImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUtils';

/**
 * Optimized Image Component with:
 * - Fast loading with caching
 * - Loading placeholder
 * - Error handling with fallback
 * - Progressive loading
 * - Memoization for performance
 */
export default function OptimizedImage({ 
    source, 
    style, 
    resizeMode = 'cover',
    placeholder = null,
    ...props 
}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Memoize fixed URL to avoid recalculating
    const imageUrl = useMemo(() => {
        if (!source?.uri) return PLACEHOLDER_IMAGE;
        return fixImageUrl(source.uri);
    }, [source?.uri]);

    // Reset states when URL changes
    useEffect(() => {
        if (imageUrl && imageUrl !== PLACEHOLDER_IMAGE) {
            setLoading(true);
            setError(false);
            setImageLoaded(false);
        } else {
            setLoading(false);
        }
    }, [imageUrl]);

    const handleLoadStart = useCallback(() => {
        setLoading(true);
        setError(false);
    }, []);

    const handleLoadEnd = useCallback(() => {
        setLoading(false);
        setImageLoaded(true);
    }, []);

    const handleError = useCallback((e) => {
        if (!error) { // Only set error once to avoid infinite loops
            setError(true);
            setLoading(false);
            setImageLoaded(false);
        }
    }, [error]);

    const displayUrl = error ? PLACEHOLDER_IMAGE : imageUrl;
    const showLoading = loading && !imageLoaded && displayUrl !== PLACEHOLDER_IMAGE;

    return (
        <View style={[style, styles.container]}>
            {displayUrl && (
                <Image
                    source={{ uri: displayUrl }}
                    style={[StyleSheet.absoluteFill, styles.image]}
                    resizeMode={resizeMode}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    // Performance optimizations
                    fadeDuration={150}
                    defaultSource={placeholder}
                    // Cache control
                    cache="force-cache"
                    {...props}
                />
            )}
            {showLoading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
                    <ActivityIndicator 
                        size="small" 
                        color={theme.colors.primary} 
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
});
