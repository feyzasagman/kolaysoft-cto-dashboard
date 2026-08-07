import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/routes/AppRouter'
import { appTheme } from '@/theme/appTheme'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3200}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
            toastStyle={{
              border: '1px solid #D0D7DE',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(31, 35, 40, 0.08)',
              fontFamily: '"IBM Plex Sans", "Segoe UI", Helvetica, Arial, sans-serif',
              fontSize: 13,
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
