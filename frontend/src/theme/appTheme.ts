import { createTheme, type ThemeOptions } from '@mui/material/styles'

/** Minimal elevation — enterprise SaaS (GitHub / Linear hissi). */
const softShadows = [
  'none',
  '0 1px 2px rgba(31, 35, 40, 0.04)',
  '0 1px 3px rgba(31, 35, 40, 0.06), 0 1px 2px rgba(31, 35, 40, 0.04)',
  '0 4px 12px rgba(31, 35, 40, 0.06)',
  '0 8px 24px rgba(31, 35, 40, 0.08)',
  ...Array.from({ length: 20 }, () => 'none'),
] as ThemeOptions['shadows']

/**
 * Enterprise SaaS theme — Primer / Linear / Vercel ilhamlı.
 * Bol beyaz alan, düşük kontrast gri, semantik renkler.
 */
export const appTheme = createTheme({
  spacing: 8,
  palette: {
    mode: 'light',
    primary: {
      main: '#0969DA',
      dark: '#0550AE',
      light: '#218BFF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#24292F',
      dark: '#0D1117',
      light: '#57606A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F6F8FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2328',
      secondary: '#656D76',
      disabled: '#8C959F',
    },
    success: { main: '#1A7F37', light: '#DAFBE1', dark: '#116329', contrastText: '#FFFFFF' },
    warning: { main: '#9A6700', light: '#FFF8C5', dark: '#7D4E00', contrastText: '#FFFFFF' },
    error: { main: '#CF222E', light: '#FFEBE9', dark: '#A40E26', contrastText: '#FFFFFF' },
    info: { main: '#0969DA', light: '#DDF4FF', dark: '#0550AE', contrastText: '#FFFFFF' },
    divider: '#D0D7DE',
    action: {
      hover: 'rgba(208, 215, 222, 0.32)',
      selected: 'rgba(9, 105, 218, 0.08)',
      focus: 'rgba(9, 105, 218, 0.12)',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif',
    // Page Title
    h1: { fontSize: '1.625rem', fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.25 },
    // Section Title
    h2: { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
    h4: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.35 },
    // Card Title
    h5: { fontSize: '0.9375rem', fontWeight: 650, lineHeight: 1.4 },
    h6: { fontSize: '0.875rem', fontWeight: 650, lineHeight: 1.4 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.45 },
    // Body
    body1: { fontSize: '0.875rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    // Caption
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#656D76' },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      color: '#656D76',
    },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: 0 },
  },
  shape: { borderRadius: 8 },
  shadows: softShadows,
  transitions: {
    duration: {
      shortest: 120,
      shorter: 160,
      short: 200,
      standard: 240,
      complex: 300,
      enteringScreen: 200,
      leavingScreen: 160,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F6F8FA' },
        '*:focus-visible': {
          outline: '2px solid #0969DA',
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: {
          borderRadius: 6,
          minHeight: 32,
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
        },
        outlined: {
          borderColor: '#D0D7DE',
          '&:hover': { borderColor: '#AFB8C1', backgroundColor: '#F6F8FA' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: 'background-color 160ms ease',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #D0D7DE',
          backgroundImage: 'none',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #D0D7DE',
          borderRadius: 8,
          transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D0D7DE',
          color: '#1F2328',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          height: 24,
          fontSize: '0.72rem',
          transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
        },
        sizeSmall: { height: 22 },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 300 },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#24292F',
          fontSize: '0.75rem',
          padding: '6px 8px',
          borderRadius: 6,
        },
        arrow: { color: '#24292F' },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F8FA',
          fontSize: '0.8125rem',
          transition: 'background-color 160ms ease',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#AFB8C1' },
          '&.Mui-focused': { backgroundColor: '#FFFFFF' },
        },
        notchedOutline: { borderColor: '#D0D7DE' },
        input: { paddingTop: 8, paddingBottom: 8 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          minHeight: 40,
          color: '#656D76',
          '&.Mui-selected': { color: '#1F2328' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 40 },
        indicator: { height: 2, borderRadius: 2 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid #D0D7DE',
          boxShadow: '0 8px 24px rgba(31, 35, 40, 0.12)',
          borderRadius: 8,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(208, 215, 222, 0.45)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', paddingTop: 10, paddingBottom: 10 },
        head: {
          fontWeight: 650,
          color: '#656D76',
          backgroundColor: '#F6F8FA',
          borderBottom: '1px solid #D0D7DE',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 120ms ease',
          '&:hover': { backgroundColor: 'rgba(208, 215, 222, 0.24)' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: '#EBEDF0' },
        bar: { borderRadius: 999 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: '1px solid #D0D7DE',
          boxShadow: '0 8px 24px rgba(31, 35, 40, 0.12)',
        },
      },
    },
  },
})

export const ACTIVITY_LEVEL_COLORS = [
  '#EBEDF0',
  '#9BE9A8',
  '#40C463',
  '#30A14E',
  '#216E39',
] as const

export const SIDEBAR_WIDTH = 240
export const SIDEBAR_COLLAPSED_WIDTH = 64
export const SIDEBAR_BG = '#0D1117'
export const SIDEBAR_BORDER = 'rgba(240,246,252,0.08)'
export const SIDEBAR_TEXT = '#C9D1D9'
export const SIDEBAR_MUTED = '#8B949E'
export const SIDEBAR_ACTIVE_BG = 'rgba(56, 139, 253, 0.15)'
export const SIDEBAR_ACTIVE_TEXT = '#79C0FF'
export const CONTENT_MAX_WIDTH = 1440

/** Tipografi rolleri — dokümantasyon / tutarlılık için. */
export const TYPE_ROLES = {
  pageTitle: 'h1',
  sectionTitle: 'h2',
  cardTitle: 'h5',
  body: 'body1',
  caption: 'caption',
} as const
