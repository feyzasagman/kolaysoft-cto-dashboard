import { Box, Toolbar } from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, sidebarWidth } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/reports': 'Weekly Reports',
  '/users': 'Users',
  '/settings': 'Settings',
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const title = useMemo(() => {
    const match = Object.keys(titleMap).find((path) => location.pathname.startsWith(path))
    return match ? titleMap[match] : 'CTO Dashboard'
  }, [location.pathname])

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(15,107,92,0.08), transparent 34%), linear-gradient(180deg, #F7FAF9 0%, #EEF3F1 100%)',
      }}
    >
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          minWidth: 0,
        }}
      >
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
