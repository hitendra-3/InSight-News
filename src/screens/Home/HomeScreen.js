import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, StatusBar, Platform } from 'react-native';
import { ActivityIndicator, Text, useTheme, Button, IconButton } from 'react-native-paper';
import { newsService, CATEGORIES } from '../../services/newsService';
import NewsCard from '../../components/NewsCard';
import { useAuth } from '../../context/AuthContext';
import { bookmarkService } from '../../services/bookmarkService';
import { supabase } from '../../services/supabase';
import { POPULAR_CHANNELS } from '../../data/channels';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { preloadImages } from '../../utils/imageUtils';

// DailyHunt-style categories
const HOME_CATEGORIES = [
    'All news',
    'Trending',
    'Politics',
    'Sports',
    'Entertainment',
    'Business',
    'Tech',
    'Health',
    'Science',
    'Local',
];

const BROWSE_OPTIONS = ['Trending', 'Recommendation', 'Newest', 'Editor Picks'];

export default function HomeScreen({ navigation }) {
    const [articles, setArticles] = useState([]);
    const [allArticles, setAllArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.dark;

    const [categories, setCategories] = useState(HOME_CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState('All news');
    const [selectedBrowse, setSelectedBrowse] = useState('Trending');
    const [selectedSource, setSelectedSource] = useState(null);

    // Auto-refresh on focus
    useFocusEffect(
        useCallback(() => {
            if (selectedCategory) {
                fetchNews(1, selectedCategory, selectedSource);
            }
        }, [selectedCategory, selectedSource])
    );

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('preferences')
                .select('categories')
                .eq('user_id', user.id)
                .single();

            if (data && data.categories && data.categories.length > 0) {
                const formattedCats = data.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1));
                setCategories(['All news', ...formattedCats]);
            }
        };
        fetchPreferences();
    }, [user]);

    const fetchNews = async (pageNum = 1, category = '', source = null) => {
        try {
            setLoading(pageNum === 1);
            let newArticles;

            // Handle special categories
            if (category === 'Trending') {
                newArticles = await newsService.fetchTrending(pageNum);
            } else if (category === 'Local') {
                newArticles = await newsService.fetchLocalNews('us', pageNum);
            } else {
                newArticles = await newsService.fetchByCategory(category, 'us', pageNum);
            }

            // Filter by source if selected
            if (source) {
                const sourceMap = {
                    'cnn': ['CNN', 'cnn.com'],
                    'bbc-news': ['BBC News', 'BBC', 'bbc.com'],
                    'msn': ['MSN', 'msn.com'],
                    'cnbc': ['CNBC', 'cnbc.com'],
                    'fox-news': ['Fox News', 'FOX', 'foxnews.com'],
                };
                
                const sourceNames = sourceMap[source] || [];
                newArticles = newArticles.filter(article => {
                    const articleSource = article.source?.name?.toLowerCase() || '';
                    return sourceNames.some(name => 
                        articleSource.includes(name.toLowerCase())
                    );
                });
            }

            // Apply sorting based on selectedBrowse
            if (pageNum === 1) {
                setAllArticles(newArticles);
                applyBrowseFilter(newArticles);
                // Preload images for first page
                const imageUrls = newArticles
                    .map(article => article.urlToImage)
                    .filter(url => url);
                if (imageUrls.length > 0) {
                    preloadImages(imageUrls.slice(0, 10)); // Preload first 10 images
                }
            } else {
                const combined = [...allArticles, ...newArticles];
                setAllArticles(combined);
                applyBrowseFilter(combined);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyBrowseFilter = (articlesToFilter) => {
        let filtered = [...articlesToFilter];
        
        switch (selectedBrowse) {
            case 'Newest':
                filtered = newsService.sortArticles(filtered, 'newest');
                break;
            case 'Trending':
                filtered = newsService.sortArticles(filtered, 'trending');
                break;
            case 'Recommendation':
                filtered = filtered.filter(a => a.urlToImage);
                filtered = newsService.sortArticles(filtered, 'newest');
                break;
            case 'Editor Picks':
                // Editor picks: articles with images, longer descriptions, from reputable sources
                filtered = filtered.filter(a => a.urlToImage && a.description && a.description.length > 100);
                filtered = newsService.sortArticles(filtered, 'trending');
                break;
            default:
                filtered = newsService.sortArticles(filtered, 'newest');
        }
        
        setArticles(filtered);
    };

    useEffect(() => {
        if (selectedCategory || selectedSource) {
            setLoading(true);
            setPage(1);
            fetchNews(1, selectedCategory, selectedSource);
        }
    }, [selectedCategory, selectedSource]);

    useEffect(() => {
        if (allArticles.length > 0) {
            applyBrowseFilter(allArticles);
        }
    }, [selectedBrowse]);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchNews(1, selectedCategory, selectedSource);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage, selectedCategory, selectedSource);
    };

    const handleBookmark = async (article) => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to save bookmarks');
            return;
        }
        await bookmarkService.addBookmark(user.id, article);
    };

    const handleSourceClick = (channel) => {
        if (selectedSource === channel.id) {
            setSelectedSource(null);
        } else {
            setSelectedSource(channel.id);
            setSelectedCategory('All news');
        }
    };

    const handleBrowseClick = (option) => {
        setSelectedBrowse(option);
    };

    const handleNotificationPress = () => {
        Alert.alert('Notifications', 'No new notifications');
    };

    const renderHeader = () => (
        <View>
            <View style={styles.topHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.latestNewsTag}>
                        <Text style={styles.latestNewsText}>LATEST NEWS</Text>
                    </View>
                </View>
                <IconButton 
                    icon={() => <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />}
                    size={24} 
                    onPress={handleNotificationPress} 
                    style={styles.notificationButton}
                />
            </View>

            {/* Category Tabs - Horizontal Scrollable */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.categoriesList}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => {
                            setSelectedCategory(item);
                            setSelectedSource(null);
                        }}
                        style={[
                            styles.categoryTab,
                            { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' },
                            selectedCategory === item && styles.categoryTabActive
                        ]}
                    >
                        <Text style={[
                            styles.categoryTabText,
                            { color: isDark ? '#E5E5EA' : '#666' },
                            selectedCategory === item && styles.categoryTabTextActive
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Popular Redactions / Channels */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular Redactions</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.channelsScroll}>
                    {POPULAR_CHANNELS.map((channel, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.channelItem}
                            onPress={() => handleSourceClick(channel)}
                        >
                            <View style={[
                                styles.channelLogoContainer,
                                { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' },
                                selectedSource === channel.id && styles.channelLogoContainerActive
                            ]}>
                                <Image source={{ uri: channel.logo }} style={styles.channelLogo} resizeMode="contain" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Browse By Section */}
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Browse By</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.browseScroll}
                    contentContainerStyle={styles.browseContent}
                >
                    {BROWSE_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => handleBrowseClick(option)}
                            style={[
                                styles.browseOption,
                                { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F5' },
                                selectedBrowse === option && styles.browseOptionActive
                            ]}
                        >
                            <Text style={[
                                styles.browseOptionText,
                                { color: isDark ? '#E5E5EA' : '#666' },
                                selectedBrowse === option && styles.browseOptionTextActive
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Latest News Section Header */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Latest News</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={articles}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item, index) => item.url + index}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <NewsCard
                        article={item}
                        variant={index === 0 ? 'featured' : 'default'}
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
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        {loading && page > 1 ? (
                            <ActivityIndicator animating={true} style={{ margin: 20 }} color={theme.colors.primary} />
                        ) : (
                            articles.length > 0 && (
                                <Button 
                                    mode="contained-tonal" 
                                    onPress={handleLoadMore} 
                                    style={styles.loadMoreBtn}
                                    buttonColor={theme.colors.primary}
                                    textColor="#FFFFFF"
                                >
                                    Load More
                                </Button>
                            )
                        )}
                        {loading && page === 1 && <ActivityIndicator animating={true} style={{ marginTop: 20 }} color={theme.colors.primary} />}
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
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    latestNewsTag: {
        backgroundColor: '#023e8a',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    latestNewsText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    notificationButton: {
        margin: 0,
    },
    categoriesList: {
        marginBottom: 20,
    },
    categoriesContent: {
        paddingHorizontal: 20,
    },
    categoryTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryTabActive: {
        backgroundColor: '#023e8a',
    },
    categoryTabText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
    },
    categoryTabTextActive: {
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
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
        fontSize: 18,
    },
    channelsScroll: {
        flexDirection: 'row',
    },
    channelItem: {
        marginRight: 16,
        alignItems: 'center',
    },
    channelLogoContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
        padding: 12,
    },
    channelLogoContainerActive: {
        borderWidth: 3,
        borderColor: '#023e8a',
    },
    channelLogo: {
        width: '100%',
        height: '100%',
    },
    browseScroll: {
        flexDirection: 'row',
    },
    browseContent: {
        paddingRight: 20,
    },
    browseOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    browseOptionActive: {
        backgroundColor: '#023e8a',
    },
    browseOptionText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
    },
    browseOptionTextActive: {
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
    },
    footerContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadMoreBtn: {
        borderRadius: 25,
        paddingVertical: 4,
    },
});
