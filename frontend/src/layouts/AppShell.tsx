import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar, sidebarWidth } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'
import { CONTENT_MAX_WIDTH } from '@/theme/appTheme'

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projeler',
  '/reports': 'Haftalık Raporlar',
  '/users': 'Kullanıcılar',
  '/settings': 'Ayarlar',
}

function usePageMeta(pathname: string) {
  return useMemo(() => {
    if (pathname.startsWith('/projects/') && pathname !== '/projects') {
      return {
        title: 'Proje Detayı',
        breadcrumbs: [
          { label: 'Ana Sayfa', to: '/projects' },
          { label: 'Projeler', to: '/projects' },
          { label: 'Detay' },
        ],
      }
    }
    if (pathname === '/reports/new') {
      return {
        title: 'Yeni Rapor',
        breadcrumbs: [
          { label: 'Ana Sayfa', to: '/reports' },
          { label: 'Raporlar', to: '/reports' },
          { label: 'Yeni' },
        ],
      }
    }
    if (pathname.match(/^\/reports\/\d+\/edit$/)) {
      return {
        title: 'Rapor Düzenle',
        breadcrumbs: [
          { label: 'Ana Sayfa', to: '/reports' },
          { label: 'Raporlar', to: '/reports' },
          { label: 'Düzenle' },
        ],
      }
    }
    if (pathname.match(/^\/reports\/\d+$/)) {
      return {
        title: 'Rapor Detayı',
        breadcrumbs: [
          { label: 'Ana Sayfa', to: '/reports' },
          { label: 'Raporlar', to: '/reports' },
          { label: 'Detay' },
        ],
      }
    }
    const match = Object.keys(titleMap).find((path) => pathname.startsWith(path))
    const title = match ? titleMap[match] : 'CTO Dashboard'
    return {
      title,
      breadcrumbs: [
        { label: 'Ana Sayfa', to: match === '/dashboard' ? '/dashboard' : '/projects' },
        { label: title },
      ],
    }
  }, [pathname])
}

/**
 * Enterprise app shell: sabit sidebar, kompakt topbar, max-width içerik.
 */
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { title, breadcrumbs } = usePageMeta(location.pathname)

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
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setMobileOpen(true)}
          onRefresh={() => window.dispatchEvent(new CustomEvent('cto:refresh'))}
        />
        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            maxWidth: CONTENT_MAX_WIDTH,
            mx: 'auto',
            width: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

/** Geriye uyumluluk alias */
export const DashboardLayout = AppShell
