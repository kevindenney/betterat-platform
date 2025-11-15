import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const name = 'yacht-racing';
const slug = 'yacht-racing';

const config: ExpoConfig = {
  name,
  slug,
  version: '1.0.0',
  scheme: 'yacht-racing',
  platforms: ['ios', 'android', 'web'],
  ios: {
    bundleIdentifier: 'com.denneyke.-betteratyacht-racing',
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.denneyke.betteratyachtracing',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-audio'],
  extra: {
    anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? null,
    stormglassApiKey: process.env.EXPO_PUBLIC_STORMGLASS_API_KEY ?? null,
  },
};

export default () => config;
