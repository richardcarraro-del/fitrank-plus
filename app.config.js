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
      supabaseUrl: "https://clwspdnaafuvjdhjhrpn.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3NwZG5hYWZ1dmpkaGpocnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NDEzMTksImV4cCI6MjA3OTUxNzMxOX0.oeOPYysYYFMmcsmMt8sHiqnEejNtNZ5cJFa48fxXUFg",
      stripePaymentLink: "https://buy.stripe.com/6oUfZheFY16i5XigSx3gk00",
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
        backgroundColor: "#0D2818",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        monochromeImage: "./assets/images/android-icon-foreground.png",
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
          backgroundColor: "#0D2818",
        },
      ],
      "expo-web-browser",
    ],
    experiments: {
      reactCompiler: true,
    },
  },
};
