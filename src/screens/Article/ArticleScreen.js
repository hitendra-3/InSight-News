import React, { useEffect } from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { FAB, useTheme } from 'react-native-paper';
import * as Speech from 'expo-speech';
import { fixLinkUrl } from '../../utils/imageUtils';

export default function ArticleScreen({ route, navigation }) {
    const { article } = route.params;
    const theme = useTheme();

    const handleShare = async () => {
        try {
            const safe = fixLinkUrl(article.url) || article.url;
            await Share.share({
                message: `Check out this news: ${article.title} - ${safe}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleSpeak = () => {
        Speech.speak(article.summary || article.title, {
            language: 'en',
            rate: 0.9
        });
    };

    useEffect(() => {
        // Stop speech when leaving screen
        return () => Speech.stop();
    }, []);

    const safeUrl = fixLinkUrl(article.url) || article.url;

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: safeUrl }}
                style={styles.webview}
                startInLoadingState={true}
            />

            <View style={styles.fabContainer}>
                <FAB
                    icon="share-variant"
                    style={[styles.fab, { backgroundColor: theme.colors.secondaryContainer }]}
                    onPress={handleShare}
                />
                <FAB
                    icon="volume-high"
                    style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
                    onPress={handleSpeak}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    fabContainer: {
        position: 'absolute',
        right: 16,
        bottom: 24,
        flexDirection: 'column',
        gap: 16
    },
    fab: {
        margin: 4,
    }
});
