import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Platform, StatusBar } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { bookmarkService } from '../../services/bookmarkService';
import NewsCard from '../../components/NewsCard';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarksScreen({ navigation }) {
    const [bookmarks, setBookmarks] = useState([]);
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.dark;

    const loadBookmarks = async () => {
        if (!user) return;
        const { data } = await bookmarkService.getBookmarks(user.id);
        if (data) {
            const adapted = data.map(b => ({
                url: b.article_url,
                title: b.title,
                summary: b.summary,
                urlToImage: b.image_url,
                publishedAt: b.published_at,
                source: { name: b.source_name },
                id: b.id
            }));
            setBookmarks(adapted);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadBookmarks();
        }, [user])
    );

    const handleRemove = async (bookmarkId) => {
        await bookmarkService.removeBookmark(bookmarkId);
        loadBookmarks();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved</Text>
            </View>
            {bookmarks.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="bookmark-outline" size={64} color={theme.colors.outline} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No bookmarks yet</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.colors.outline }]}>Save articles to read them later</Text>
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <NewsCard
                            article={item}
                            variant="default"
                            onPress={() => navigation.navigate('Article', { article: item })}
                            onBookmark={() => handleRemove(item.id)}
                            isBookmarked={true}
                        />
                    )}
                    // Performance optimizations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={8}
                    updateCellsBatchingPeriod={100}
                    initialNumToRender={6}
                    windowSize={8}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    headerTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 28,
    },
    listContent: {
        paddingBottom: 320,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        textAlign: 'center',
    },
});
