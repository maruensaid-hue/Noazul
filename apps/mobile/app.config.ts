import type { ExpoConfig } from "expo/config";

// Google's public sample AdMob App IDs — safe to ship as a fallback while
// EXPO_PUBLIC_ADMOB_APP_ID_* isn't set (see .env.example). Real IDs come
// from the AdMob console once the app is registered there.
const TEST_ADMOB_APP_ID_ANDROID = "ca-app-pub-3940256099942544~3347511713";
const TEST_ADMOB_APP_ID_IOS = "ca-app-pub-3940256099942544~1458002511";

const config: ExpoConfig = {
  name: "NoAzul",
  slug: "noazul",
  scheme: "noazul",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "br.com.noazul.app",
  },
  android: {
    package: "br.com.noazul.app",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0B1220",
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || TEST_ADMOB_APP_ID_ANDROID,
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || TEST_ADMOB_APP_ID_IOS,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      // Filled in by `eas init` once the project is registered at expo.dev.
      projectId: process.env.EAS_PROJECT_ID ?? "",
    },
  },
};

export default config;
