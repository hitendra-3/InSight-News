import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Platform, StatusBar } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { newsService, HASHTAG_MAP } from '../../services/newsService';
import NewsCard from '../../components/NewsCard';
import { useAuth } from '../../context/AuthContext';
import { bookmarkService } from '../../services/bookmarkService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { preloadImages } from '../../utils/imageUtils';

// DailyHunt-style categories for Explore
const EXPLORE_CATEGORIES = [
    { id: 'trending', name: 'Trending', icon: 'trending-up' },
    { id: 'politics', name: 'Politics', icon: 'megaphone' },
    { id: 'sports', name: 'Sports', icon: 'football' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'technology', name: 'Tech', icon: 'laptop' },
    { id: 'health', name: 'Health', icon: 'medical' },
    { id: 'local', name: 'Local', icon: 'location' },
];

export default function ExploreScreen({ navigation }) {
    const [trendingNews, setTrendingNews] = useState([]);
    const [localNews, setLocalNews] = useState([]);
    const [categoryNews, setCategoryNews] = useState({});
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('trending');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.dark;

    // Auto-refresh on focus
    useFocusEffect(
        useCallback(() => {
            fetchExploreContent();
        }, [])
    );

    const fetchExploreContent = async () => {
        try {
            setLoading(true);
            
            // Fetch trending news
            const trending = await newsService.fetchTrending(1);
            setTrendingNews(trending);
            
            // Preload trending images
            const trendingImageUrls = trending
                .map(article => article.urlToImage)
                .filter(url => url)
                .slice(0, 10);
            if (trendingImageUrls.length > 0) {
                preloadImages(trendingImageUrls);
            }
            
            // Extract trending hashtags from articles
            const hashtags = newsService.extractTrendingHashtags(trending, 15);
            setTrendingHashtags(hashtags);
            
            // Fetch local news
            const local = await newsService.fetchLocalNews('us', 1);
            setLocalNews(local.slice(0, 6));
            
            // Pre-fetch category news
            const categoryMap = {
                'politics': 'Politics',
                'sports': 'Sports',
                'entertainment': 'Entertainment',
                'business': 'Business',
                'technology': 'Tech',
            };
            const categoryData = {};
            for (const [key, cat] of Object.entries(categoryMap)) {
                const articles = await newsService.fetchByCategory(cat, 'us', 1);
                categoryData[key] = articles.slice(0, 4);
            }
            setCategoryNews(categoryData);
            
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchExploreContent();
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await newsService.searchNews(query, 1);
            setSearchResults(results);
            // Preload search result images
            const imageUrls = results
                .map(article => article.urlToImage)
                .filter(url => url)
                .slice(0, 10);
            if (imageUrls.length > 0) {
                preloadImages(imageUrls);
            }
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleHashtagClick = async (hashtag) => {
        setSearchQuery(hashtag);
        await handleSearch(hashtag);
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleBookmark = async (article) => {
        if (!user) return;
        await bookmarkService.addBookmark(user.id, article);
    };

    const getCurrentNews = () => {
        if (searchResults.length > 0) {
            return searchResults;
        }
        
        if (selectedCategory === 'trending') {
            return trendingNews;
        } else if (selectedCategory === 'local') {
            return localNews;
        } else {
            return categoryNews[selectedCategory] || [];
        }
    };

    const renderHeader = () => (
        <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' }]}>
                    <Ionicons name="search" size={20} color={theme.colors.outline} style={styles.searchIconLeft} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search news or hashtags..."
                        placeholderTextColor={theme.colors.outline}
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            if (text.length > 2) {
                                handleSearch(text);
                            } else {
                                setSearchResults([]);
                            }
                        }}
                        returnKeyType="search"
                        onSubmitEditing={() => handleSearch(searchQuery)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                        }}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Trending Hashtags */}
            {trendingHashtags.length > 0 && !searchQuery && (
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Trending Hashtags</Text>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.tagsScroll}
                        contentContainerStyle={styles.tagsContent}
                    >
                        {trendingHashtags.map((hashtag, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.tagButton, { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' }]}
                                onPress={() => handleHashtagClick(hashtag)}
                            >
                                <Ionicons name="pricetag" size={14} color="#023e8a" style={{ marginRight: 4 }} />
                                <Text style={[styles.tagText, { color: theme.colors.text }]}>{hashtag}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Category Chips */}
            {!searchQuery && (
                <View style={styles.sectionContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.categoriesScroll}
                        contentContainerStyle={styles.categoriesContent}
                    >
                        {EXPLORE_CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                onPress={() => handleCategoryClick(category.id)}
                                style={[
                                    styles.categoryChip,
                                    { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' },
                                    selectedCategory === category.id && styles.categoryChipActive
                                ]}
                            >
                                <Ionicons 
                                    name={category.icon} 
                                    size={16} 
                                    color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.outline} 
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[
                                    styles.categoryChipText,
                                    { color: selectedCategory === category.id ? '#FFFFFF' : theme.colors.text },
                                    selectedCategory === category.id && styles.categoryChipTextActive
                                ]}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Section Title */}
            {!searchQuery && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {selectedCategory === 'trending' ? 'Trending Now' :
                         selectedCategory === 'local' ? 'Local News' :
                         EXPLORE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'News'}
                    </Text>
                </View>
            )}

            {searchQuery && searchResults.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Search Results for "{searchQuery}"
                    </Text>
                </View>
            )}
        </View>
    );

    const currentNews = getCurrentNews();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={currentNews}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item, index) => item.url + index}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <NewsCard
                        article={item}
                        variant={index === 0 && !searchQuery ? 'featured' : 'default'}
                        onPress={() => navigation.navigate('Article', { article: item })}
                        onBookmark={() => handleBookmark(item)}
                        isBookmarked={false}
                    />
                )}
                // Performance optimizations for fast scrolling
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={100}
                initialNumToRender={6}
                windowSize={8}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {isSearching ? (
                            <ActivityIndicator animating={true} color={theme.colors.primary} />
                        ) : (
                            <>
                                <Ionicons name="search-outline" size={64} color={theme.colors.outline} />
                                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                                    {searchQuery ? 'No results found' : 'No news available'}
                                </Text>
                            </>
                        )}
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    },
    listContent: {
        paddingBottom: 320,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 48,
    },
    searchIconLeft: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
    },
    sectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
        marginBottom: 12,
    },
    tagsScroll: {
        flexDirection: 'row',
    },
    tagsContent: {
        paddingRight: 20,
    },
    tagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    tagText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
    },
    categoriesScroll: {
        flexDirection: 'row',
    },
    categoriesContent: {
        paddingRight: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#023e8a',
    },
    categoryChipText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
    },
    categoryChipTextActive: {
        fontFamily: 'Poppins_700Bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});
