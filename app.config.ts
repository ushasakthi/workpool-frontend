import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'workpool-frontend',
  slug: 'workpool-frontend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'workpoolfrontend',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.workpool.app',
  },
  android: {
    package: 'com.workpool.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Firebase settings for push notifications (kept out of git).
    // EAS cloud builds get the file from the GOOGLE_SERVICES_JSON file variable.
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow WorkPool to access your photos to upload your NIC.',
        cameraPermission: false,
      },
    ],
    'expo-notifications',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    // Backend REST API base URL, including the /api/v1 prefix.
    apiUrl: process.env.API_URL ?? 'http://localhost:3000/api/v1',
    // links the app to the expo.dev project, needed to get a push token
    eas: {
      projectId: '6e5e2795-be77-46cc-8e0b-48503b581f36',
    },
  },
};

export default config;
