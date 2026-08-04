import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary']
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary']
  }
}

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F6B5C',
      dark: '#0A4F44',
      light: '#3A8F81',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1F3A5F',
      dark: '#152840',
      light: '#4A6485',
    },
    background: {
      default: '#F3F6F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#15231F',
      secondary: '#4F635D',
    },
    success: { main: '#2E7D4F' },
    warning: { main: '#C47B16' },
    error: { main: '#B42318' },
    divider: 'rgba(21, 35, 31, 0.1)',
    brand: {
      main: '#0F6B5C',
      dark: '#0A4F44',
      light: '#3A8F81',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h1: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 650 },
    h4: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 650 },
    h5: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"DM Sans", "IBM Plex Sans", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(21, 35, 31, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(21, 35, 31, 0.08)',
        },
      },
    },
  },
})
