import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme, configureFonts } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useThemeContext } from './src/context/ThemeContext';
import RootNavigator from './src/navigation';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Theme setup
const { LightTheme } = adaptNavigationTheme({ reactNavigationLight: MD3LightTheme });
const { DarkTheme } = adaptNavigationTheme({ reactNavigationDark: MD3DarkTheme });

const fontConfig = {
  fontFamily: 'Poppins_400Regular',
};

const customLightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
    colors: {
    ...MD3LightTheme.colors,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#023e8a', // New brand blue
    accent: '#023e8a',
    text: '#1A1A1A',
    onSurface: '#1A1A1A',
    outline: '#8E8E93',
  }
};

const customDarkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
    colors: {
    ...MD3DarkTheme.colors,
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#023e8a', // New brand blue
    accent: '#023e8a',
    text: '#FFFFFF',
    onSurface: '#FFFFFF',
    outline: '#8E8E93',
  }
};

function Main() {
  const { isDarkMode } = useThemeContext();
  const theme = isDarkMode ? customDarkTheme : customLightTheme;

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <AuthProvider>
          <Main />
        </AuthProvider>
      </ThemeProvider>
    </View>
  );
}
