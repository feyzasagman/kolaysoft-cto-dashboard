import { createTheme, type ThemeOptions } from '@mui/material/styles'

const noShadows = Array.from({ length: 25 }, () => 'none') as ThemeOptions['shadows']

/**
 * Enterprise SaaS theme — Primer / Linear / MUI dashboard ilhamlı, özgün.
 * İnce border, kompakt spacing, nötr palet, anlamlı renk kullanımı.
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
    },
    success: { main: '#1A7F37', light: '#DAFBE1', dark: '#116329', contrastText: '#FFFFFF' },
    warning: { main: '#9A6700', light: '#FFF8C5', dark: '#7D4E00', contrastText: '#FFFFFF' },
    error: { main: '#CF222E', light: '#FFEBE9', dark: '#A40E26', contrastText: '#FFFFFF' },
    info: { main: '#0969DA', light: '#DDF4FF', dark: '#0550AE', contrastText: '#FFFFFF' },
    divider: '#D0D7DE',
    action: {
      hover: 'rgba(208, 215, 222, 0.32)',
      selected: 'rgba(9, 105, 218, 0.08)',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h2: { fontSize: '1.5rem', fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
    h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, color: '#656D76' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', letterSpacing: 0 },
  },
  shape: { borderRadius: 8 },
  shadows: noShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F6F8FA' },
        '*:focus-visible': {
          outline: '2px solid #0969DA',
          outlineOffset: 2,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: { borderRadius: 6, minHeight: 32 },
        outlined: {
          borderColor: '#D0D7DE',
          '&:hover': { borderColor: '#AFB8C1', backgroundColor: '#F6F8FA' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #D0D7DE',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid #D0D7DE', borderRadius: 8 },
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
        root: { borderRadius: 999, fontWeight: 600, height: 22, fontSize: '0.72rem' },
        sizeSmall: { height: 20 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#24292F',
          fontSize: '0.75rem',
          padding: '6px 8px',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F8FA',
          fontSize: '0.8125rem',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#AFB8C1' },
          '&.Mui-focused': { backgroundColor: '#FFFFFF' },
        },
        notchedOutline: { borderColor: '#D0D7DE' },
        input: { paddingTop: 8, paddingBottom: 8 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', paddingTop: 8, paddingBottom: 8 },
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
          '&:hover': { backgroundColor: 'rgba(208, 215, 222, 0.24)' },
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
export const SIDEBAR_BG = '#0D1117'
export const SIDEBAR_BORDER = 'rgba(240,246,252,0.08)'
export const SIDEBAR_TEXT = '#C9D1D9'
export const SIDEBAR_MUTED = '#8B949E'
export const SIDEBAR_ACTIVE_BG = 'rgba(56, 139, 253, 0.15)'
export const SIDEBAR_ACTIVE_TEXT = '#79C0FF'
export const CONTENT_MAX_WIDTH = 1440
