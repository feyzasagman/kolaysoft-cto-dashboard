import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

const theme = createTheme()

interface WrapperOptions {
  route?: string
}

function Providers({ children, route = '/' }: { children: ReactNode; route?: string }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </ThemeProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => <Providers route={route}>{children}</Providers>,
    ...options,
  })
}
