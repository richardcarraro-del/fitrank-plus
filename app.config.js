module.exports = {
  expo: {
    name: "FitRank+",
    slug: "fitrank-plus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fitrankplus",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "ca78fd8c-e890-43a4-aec8-977ed3cfde09"
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fitrankplus.app",
    },
    android: {
      package: "com.fitrankplus.app",
      adaptiveIcon: {
        backgroundColor: "#0A0E27",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "single",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0A0E27",
        },
      ],
      "expo-web-browser",
    ],
    experiments: {
      reactCompiler: true,
    },
  },
};
