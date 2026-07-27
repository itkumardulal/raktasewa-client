import { createTheme } from "@mui/material/styles";

/** Premium admin palette (Linear / Vercel inspired) */
export const adminColors = {
  primary: "#DC2626",
  success: "#22C55E",
  warning: "#F59E0B",
  info: "#3B82F6",
  bg: "#0F172A",
  card: "#1E293B",
  text: "#FFFFFF",
  muted: "#94A3B8",
  border: "rgba(148, 163, 184, 0.16)",
};

const sharedTypography = {
  fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
  h4: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: '"Outfit", "DM Sans", sans-serif',
  },
  h5: {
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: '"Outfit", "DM Sans", sans-serif',
  },
  h6: {
    fontWeight: 650,
    fontFamily: '"Outfit", "DM Sans", sans-serif',
  },
  button: { textTransform: "none", fontWeight: 600 },
};

const adminTheme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  defaultColorScheme: "dark",
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        primary: { main: adminColors.primary },
        secondary: { main: adminColors.info },
        success: { main: adminColors.success },
        warning: { main: adminColors.warning },
        info: { main: adminColors.info },
        background: {
          default: adminColors.bg,
          paper: adminColors.card,
        },
        text: {
          primary: adminColors.text,
          secondary: adminColors.muted,
        },
        divider: adminColors.border,
      },
    },
    light: {
      palette: {
        mode: "light",
        primary: { main: adminColors.primary },
        secondary: { main: adminColors.info },
        success: { main: adminColors.success },
        warning: { main: adminColors.warning },
        info: { main: adminColors.info },
        background: {
          default: "#F8FAFC",
          paper: "#FFFFFF",
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        },
      },
    },
  },
  typography: sharedTypography,
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#475569 #0F172A",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${adminColors.border}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          marginBlock: 2,
          "&.Mui-selected": {
            backgroundColor: "rgba(220, 38, 38, 0.16)",
            "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.22)" },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

export default adminTheme;
