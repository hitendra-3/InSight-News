import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Text, Chip, IconButton, useTheme, Surface } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { fixImageUrl, PLACEHOLDER_IMAGE, preloadImage, fixLinkUrl } from '../utils/imageUtils';
import OptimizedImage from './OptimizedImage';

export default function NewsCard({ article, onPress, onBookmark, isBookmarked, variant = 'default' }) {
    const theme = useTheme();
    const isDark = theme.dark;
    const [imageError, setImageError] = useState(false);

    const timeAgo = article.publishedAt
        ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
        : '';

    // Memoize image URL fixing
    const imageUrl = useMemo(() => {
        if (!article.urlToImage) return null;
        return fixImageUrl(article.urlToImage);
    }, [article.urlToImage]);

    // Preload image when component mounts
    useEffect(() => {
        if (imageUrl && imageUrl !== PLACEHOLDER_IMAGE) {
            // Preload in background without blocking
            preloadImage(imageUrl).catch(() => {
                // Silent fail, will show placeholder if needed
            });
        }
    }, [imageUrl]);

    const handleShare = async () => {
        try {
            const safe = fixLinkUrl(article.url) || article.url;
            await Share.share({
                message: `${article.title}\n\n${safe}`,
                title: article.title,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // For featured cards with multiple images
    if (variant === 'featured' && imageUrl) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.featuredCardWrapper}>
                <Surface style={[styles.featuredCard, { backgroundColor: theme.colors.surface }]} elevation={0}>
                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            {article.source?.name && (
                                <Chip
                                    textStyle={{ 
                                        fontSize: 11, 
                                        fontFamily: 'Poppins_700Bold', 
                                        color: isDark ? '#E5E5EA' : '#666',
                                        paddingHorizontal: 0,
                                    }}
                                    style={[
                                        styles.chip,
                                        { 
                                            backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                                        }
                                    ]}
                                    mode="flat"
                                >
                                    {article.source.name}
                                </Chip>
                            )}
                            <Text style={[styles.date, { color: theme.colors.outline }]}>{timeAgo}</Text>
                        </View>

                        <Text variant="titleLarge" numberOfLines={3} style={[styles.featuredTitle, { color: theme.colors.text }]}>
                            {article.title}
                        </Text>

                        {/* Multiple Images Grid */}
                        <View style={styles.imageGrid}>
                            <View style={styles.mainImageContainer}>
                                <OptimizedImage 
                                    source={{ uri: imageUrl }} 
                                    style={styles.mainImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <View style={styles.sideImagesContainer}>
                                <OptimizedImage 
                                    source={{ uri: imageUrl }} 
                                    style={styles.sideImage}
                                    resizeMode="cover"
                                />
                                <OptimizedImage 
                                    source={{ uri: imageUrl }} 
                                    style={styles.sideImageLast}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.footer}>
                            <View style={styles.actionButtons}>
                                <IconButton
                                    icon="share-outline"
                                    size={18}
                                    iconColor={theme.colors.outline}
                                    onPress={handleShare}
                                    style={{ margin: 0 }}
                                />
                            </View>
                            <View style={styles.spacer} />
                            <IconButton
                                icon={isBookmarked ? "bookmark" : "bookmark-outline"}
                                selected={isBookmarked}
                                onPress={onBookmark}
                                size={18}
                                iconColor={isBookmarked ? theme.colors.primary : theme.colors.outline}
                                style={{ margin: 0 }}
                            />
                        </View>
                    </View>
                </Surface>
            </TouchableOpacity>
        );
    }

    // Compact card variant for side-by-side layout
    if (variant === 'compact') {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.compactCardWrapper}>
                <Surface style={[styles.compactCard, { backgroundColor: theme.colors.surface }]} elevation={0}>
                    <View style={styles.compactContent}>
                        <View style={styles.compactTextContainer}>
                            <Text variant="titleSmall" numberOfLines={3} style={[styles.compactTitle, { color: theme.colors.text }]}>
                                {article.title}
                            </Text>
                            <View style={styles.compactMeta}>
                                {article.source?.name && (
                                    <Text style={[styles.compactSource, { color: theme.colors.outline }]}>{article.source.name}</Text>
                                )}
                                <Text style={[styles.compactDate, { color: theme.colors.outline }]}>
                                    {timeAgo}
                                </Text>
                            </View>
                        </View>
                        {imageUrl && (
                            <OptimizedImage 
                                source={{ uri: imageUrl }} 
                                style={styles.compactImage}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </Surface>
            </TouchableOpacity>
        );
    }

    // Default card
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={0}>
                {imageUrl && (
                    <OptimizedImage 
                        source={{ uri: imageUrl }} 
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        {article.source?.name && (
                            <Chip
                                textStyle={{ 
                                    fontSize: 11, 
                                    fontFamily: 'Poppins_700Bold', 
                                    color: isDark ? '#E5E5EA' : '#666',
                                    paddingHorizontal: 0,
                                }}
                                style={[
                                    styles.chip,
                                    { 
                                        backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5',
                                    }
                                ]}
                                mode="flat"
                            >
                                {article.source.name}
                            </Chip>
                        )}
                        <Text style={[styles.date, { color: theme.colors.outline }]}>{timeAgo}</Text>
                    </View>

                    <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
                        {article.title}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.actionButtons}>
                            <IconButton
                                icon="share-outline"
                                size={18}
                                iconColor={theme.colors.outline}
                                onPress={handleShare}
                                style={{ margin: 0 }}
                            />
                        </View>
                        <View style={styles.spacer} />
                        <IconButton
                            icon={isBookmarked ? "bookmark" : "bookmark-outline"}
                            selected={isBookmarked}
                            onPress={onBookmark}
                            size={18}
                            iconColor={isBookmarked ? theme.colors.primary : theme.colors.outline}
                            style={{ margin: 0 }}
                        />
                    </View>
                </View>
            </Surface>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        height: 220,
        width: '100%',
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    chip: {
        height: 28,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 14,
    },
    date: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    spacer: {
        flex: 1,
    },
    // Featured Card Styles
    featuredCardWrapper: {
        marginVertical: 12,
        marginHorizontal: 16,
    },
    featuredCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    featuredTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        lineHeight: 30,
        marginBottom: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        height: 200,
        marginBottom: 16,
    },
    mainImageContainer: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 8,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    sideImagesContainer: {
        flex: 1,
    },
    sideImage: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    sideImageLast: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    // Compact Card Styles
    compactCardWrapper: {
        flex: 1,
        marginHorizontal: 6,
        marginVertical: 8,
    },
    compactCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    compactContent: {
        flexDirection: 'row',
        padding: 12,
    },
    compactTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    compactTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    compactMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactSource: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        marginRight: 8,
    },
    compactDate: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
    },
    compactImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
});
