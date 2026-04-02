import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    // Core
    colorPrimary: "#1351AA",
    colorInfo: "#1351AA",
    colorSuccess: "#0B5107",
    colorError: "#AB1313",
    colorWarning: "#E0A800",

    // Text
    colorText: "#1B1C1E",
    colorTextSecondary: "#4A4A4A",
    colorTextDisabled: "#9CA3AF",

    // Backgrounds
    colorBgBase: "#E8F1FC",
    colorBgLayout: "#F5F5F5",
    colorBgContainer: "#FFFFFF",

    // Borders
    colorBorder: "#D1D5DB",
    borderRadius: 8,

    // Font
    fontFamily: "Inter, system-ui, sans-serif",
  },

  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      fontWeight: 500,
    },

    Layout: {
      headerBg: "#FFFFFF",
      bodyBg: "#F5F5F5",
    },

    Menu: {
      itemSelectedColor: "#1351AA",
      itemSelectedBg: "#E6F0FF",
      itemHoverColor: "#1351AA",
    },

    Input: {
      borderRadius: 8,
    },

    Card: {
      borderRadiusLG: 12,
    },
  },
};
