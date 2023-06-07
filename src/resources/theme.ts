import {
  createTheme,
} from "@material-ui/core";
import { yellow } from "@material-ui/core/colors";

export const theme = createTheme({
  palette: {
    type: "light",
    background: {
      default: "#F8F8F8",
    },
    status: {
      ok: "#1DB954",
      warning: "#FF9800",
      error: "#E22134",
      running: "#2E77D0",
      pending: "#FFED51",
      aborted: "#757575",
    },
    bursts: {
      fontColor: "#FEFEFE",
      slackChannelText: "#ddd",
      backgroundColor: {
        default: "#7C3699",
      },
    },
    primary: {
      main: "#2E77D0",
    },
    banner: {
      info: "#2E77D0",
      error: "#E22134",
      text: "#FFFFFF",
      link: "#000000",
    },
    border: "#E6E6E6",
    textContrast: "#000000",
    textVerySubtle: "#DDD",
    textSubtle: "#6E6E6E",
    highlight: "#FFFBCC",
    errorBackground: "#FFEBEE",
    warningBackground: "#F59B23",
    infoBackground: "#ebf5ff",
    errorText: "#CA001B",
    infoText: "#004e8a",
    warningText: "#000000",
    linkHover: "#2196F3",
    link: "#0A6EBE",
    gold: yellow.A700,
    navigation: {
      background: "#171717",
      indicator: "#9BF0E1",
      color: "#b5b5b5",
      selectedColor: "#FFF",
    },
    pinSidebarButton: {
      icon: "#181818",
      background: "#BDBDBD",
    },
    tabbar: {
      indicator: "#9BF0E1",
    },
  },
  defaultPageTheme: "home",
} as any);
