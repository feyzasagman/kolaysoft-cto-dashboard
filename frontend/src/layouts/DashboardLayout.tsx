import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, sidebarWidth } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projeler',
  '/reports': 'Haftalık Raporlar',
  '/users': 'Kullanıcılar',
  '/settings': 'Ayarlar',
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const title = useMemo(() => {
    if (location.pathname.startsWith('/projects/')) return 'Project Detail'
    const match = Object.keys(titleMap).find((path) => location.pathname.startsWith(path))
    return match ? titleMap[match] : 'CTO Dashboard'
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
