import React from 'react';
import { View, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { List, Switch, useTheme, Divider, Text, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const theme = useTheme();
    const isDark = theme.dark;

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
            </View>

            <List.Section style={styles.section}>
                <Surface style={[styles.group, { backgroundColor: theme.colors.surface }]} elevation={0}>
                    <List.Item
                        title="Dark Mode"
                        titleStyle={[styles.itemTitle, { color: theme.colors.text }]}
                        left={() => (
                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#023e8a' : '#1A1A1A' }]}>
                                <Ionicons name="moon" size={20} color="white" />
                            </View>
                        )}
                        right={() => (
                            <Switch 
                                value={isDarkMode} 
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#E5E5EA', true: '#023e8a' }}
                                thumbColor="#FFFFFF"
                            />
                        )}
                        style={styles.item}
                    />
                </Surface>
            </List.Section>

            <List.Section style={styles.section}>
                <Surface style={[styles.group, { backgroundColor: theme.colors.surface }]} elevation={0}>
                    <List.Item
                        title="Account"
                        description={user?.email}
                        titleStyle={[styles.itemTitle, { color: theme.colors.text }]}
                        descriptionStyle={[styles.itemDescription, { color: theme.colors.outline }]}
                        left={() => (
                            <View style={[styles.iconBox, { backgroundColor: '#023e8a' }]}>
                                <Ionicons name="person" size={20} color="white" />
                            </View>
                        )}
                    />
                    <Divider style={{ marginLeft: 56, backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }} />
                    <List.Item
                        title="Log Out"
                        titleStyle={[styles.itemTitle, { color: '#FF3B30' }]}
                        onPress={logout}
                        left={() => (
                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                            </View>
                        )}
                    />
                </Surface>
            </List.Section>

            <Text style={[styles.versionText, { color: theme.colors.outline }]}>
                Version 1.0.0
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 320,
    },
    header: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
        paddingBottom: 24,
    },
    headerTitle: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 28,
    },
    section: {
        marginBottom: 24,
    },
    group: {
        marginHorizontal: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        paddingVertical: 12,
    },
    itemTitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
    },
    itemDescription: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        marginTop: 2,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        alignSelf: 'center',
        marginLeft: 12,
    },
    versionText: {
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        marginTop: 32,
    },
});
