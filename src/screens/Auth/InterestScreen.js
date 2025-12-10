import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const INTERESTS = [
    { id: 'politics', name: 'Politics', image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'business', name: 'Business', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'entertainment', name: 'Culture', image: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'health', name: 'Healthy', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'science', name: 'Nature', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'politics', name: 'Politics', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'sports', name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
    { id: 'technology', name: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
];

export default function InterestScreen({ navigation }) {
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const theme = useTheme();

    const toggleInterest = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSave = async () => {
        if (!user) {
            navigation.replace('Login');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('preferences')
                .update({ categories: selected })
                .eq('user_id', user.id);

            if (error) throw error;

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView 
            contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text variant="headlineLarge" style={styles.title}>Pick your interests</Text>
                <Text style={styles.subtitle}>
                    We'll use this info to personalize your feed to recommend things you'll like.
                </Text>
            </View>

            <View style={styles.grid}>
                {INTERESTS.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                        <TouchableOpacity
                            key={`${item.id}-${item.name}`}
                            style={styles.cardWrapper}
                            onPress={() => toggleInterest(item.id)}
                            activeOpacity={0.8}
                        >
                            <ImageBackground
                                source={{ uri: item.image }}
                                style={styles.cardImage}
                                imageStyle={{ borderRadius: 16 }}
                            >
                                <View style={[
                                    styles.overlay,
                                    isSelected && styles.overlaySelected
                                ]}>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardText}>{item.name}</Text>
                                        <View style={[
                                            styles.radio,
                                            isSelected && styles.radioSelected
                                        ]}>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    disabled={selected.length === 0}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    buttonColor="#1A1A1A"
                    textColor="#FFFFFF"
                >
                    Save
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        marginBottom: 12,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        maxWidth: '85%',
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        lineHeight: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 16,
        aspectRatio: 1.2,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'flex-end',
    },
    overlaySelected: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        fontSize: 16,
        flex: 1,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        backgroundColor: '#023e8a',
        borderColor: '#023e8a',
    },
    footer: {
        marginTop: 8,
    },
    viewAllButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    viewAllText: {
        color: '#023e8a',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
    button: {
        borderRadius: 30,
        elevation: 0,
    },
    buttonContent: {
        paddingVertical: 10,
    },
});
