import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import InterestScreen from '../screens/Auth/InterestScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import ArticleScreen from '../screens/Article/ArticleScreen';
import BookmarksScreen from '../screens/Bookmarks/BookmarksScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
            <AuthStack.Screen name="Interest" component={InterestScreen} />
        </AuthStack.Navigator>
    );
}

function HomeStack() {
    const theme = useTheme();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Feed" component={HomeScreen} />
            <Stack.Screen
                name="Article"
                component={ArticleScreen}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.colors.surface },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: { fontFamily: 'Poppins_700Bold' },
                }}
            />
        </Stack.Navigator>
    );
}

function ExploreStack() {
    const theme = useTheme();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen
                name="Article"
                component={ArticleScreen}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.colors.surface },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: { fontFamily: 'Poppins_700Bold' },
                }}
            />
        </Stack.Navigator>
    );
}

function BookmarksStack() {
    const theme = useTheme();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Saved" component={BookmarksScreen} />
            <Stack.Screen
                name="Article"
                component={ArticleScreen}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.colors.surface },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: { fontFamily: 'Poppins_700Bold' },
                }}
            />
        </Stack.Navigator>
    );
}

function MainNavigator() {
    const theme = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'compass' : 'compass-outline';
                    } else if (route.name === 'Saved') {
                        iconName = focused ? 'bookmark' : 'bookmark-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    height: 80,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Poppins_400Regular',
                    fontSize: 11,
                    marginTop: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Explore" component={ExploreStack} />
            <Tab.Screen name="Saved" component={BookmarksStack} />
            <Tab.Screen name="Profile" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            {user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
