import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { authService } from '../../services/authService';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = useTheme();

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await authService.login(email, password);
        setLoading(false);
        if (error) {
            setError(error.message);
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.text }]}>FlashNews</Text>
                <Text variant="titleSmall" style={[styles.subtitle, { color: theme.colors.outline }]}>Fast, focused news — stay informed.</Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                />

                {error ? <Text style={{ color: theme.colors.error, marginBottom: 10 }}>{error}</Text> : null}

                <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button} buttonColor={theme.colors.primary} textColor="#FFFFFF">
                    Sign In
                </Button>

                <View style={styles.footerRow}>
                    <Text style={{ color: theme.colors.outline }}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: theme.colors.primary, fontWeight: '700', marginLeft: 8 }}>Create account</Text>
                    </TouchableOpacity>
                </View>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
    },
    title: {
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
        marginBottom: 6,
        fontSize: 28,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 18,
        opacity: 0.9,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 8,
        borderRadius: 30,
    },
    footerRow: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
