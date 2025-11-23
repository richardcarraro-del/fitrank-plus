import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#FF6B35",
    link: "#FF6B35",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F2F2F2",
    backgroundSecondary: "#E6E6E6",
    backgroundTertiary: "#D9D9D9",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0A8C9",
    textTertiary: "#6B7398",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7398",
    tabIconSelected: "#FF6B35",
    link: "#FF6B35",
    backgroundRoot: "#0A0E27",
    backgroundDefault: "#1A1F3A",
    backgroundSecondary: "#252B4A",
    backgroundTertiary: "#3A4268",
    primary: "#FF6B35",
    primaryDark: "#E85A28",
    secondary: "#4ECDC4",
    success: "#4ECDC4",
    warning: "#FFD93D",
    error: "#FF6B6B",
    premium: "#FFD700",
    border: "#3A4268",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  inputHeight: 48,
  buttonHeight: 52,
  tabBarHeight: 65,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 26,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
