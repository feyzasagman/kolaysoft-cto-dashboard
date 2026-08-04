import { createTheme } from '@mui/material/styles'

/**
 * GitHub ilhamlı kurumsal tasarım sistemi.
 * Birebir kopya değil: koyu sidebar, ince border, düşük gölge, veri odaklı palet.
 */
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1F6F54',
      dark: '#0F5132',
      light: '#3D9973',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#24292F',
      dark: '#161B22',
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
    success: { main: '#1A7F37', light: '#DAFBE1', dark: '#116329' },
    warning: { main: '#9A6700', light: '#FFF8C5', dark: '#7D4E00' },
    error: { main: '#CF222E', light: '#FFEBE9', dark: '#A40E26' },
    info: { main: '#0969DA', light: '#DDF4FF', dark: '#0550AE' },
    divider: '#D0D7DE',
    action: {
      hover: 'rgba(31, 35, 40, 0.04)',
      selected: 'rgba(31, 111, 84, 0.08)',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif',
    h1: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 650 },
    h4: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 650 },
    h5: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: '#656D76' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F6F8FA',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        outlined: {
          borderColor: '#D0D7DE',
          '&:hover': {
            borderColor: '#AFB8C1',
            backgroundColor: '#F6F8FA',
          },
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
        root: {
          border: '1px solid #D0D7DE',
          borderRadius: 8,
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
          height: 22,
          fontSize: '0.72rem',
        },
        sizeSmall: {
          height: 20,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#24292F',
          fontSize: '0.75rem',
          padding: '8px 10px',
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#F6F8FA',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#AFB8C1',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
          },
        },
        notchedOutline: {
          borderColor: '#D0D7DE',
        },
      },
    },
  },
})

/** Contribution graph renk skalası (level 0–4) */
export const ACTIVITY_LEVEL_COLORS = [
  '#EBEDF0', // 0
  '#9BE9A8', // 1
  '#40C463', // 2
  '#30A14E', // 3
  '#216E39', // 4
] as const

export const SIDEBAR_BG = '#0D1B16'
export const SIDEBAR_BORDER = 'rgba(255,255,255,0.08)'
export const SIDEBAR_TEXT = '#C9D1D9'
export const SIDEBAR_MUTED = '#8B949E'
export const SIDEBAR_ACTIVE_BG = 'rgba(63, 185, 135, 0.15)'
export const SIDEBAR_ACTIVE_TEXT = '#7EE2B8'
