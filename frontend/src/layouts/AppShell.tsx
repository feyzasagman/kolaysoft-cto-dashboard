import { Box } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'
import { CONTENT_MAX_WIDTH, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/theme/appTheme'

const COLLAPSE_KEY = 'cto.sidebar.collapsed'

const titleMap: Record<string, string> = {
  '/dashboard': 'Kontrol Paneli',
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
          { label: 'Kontrol Paneli', to: '/dashboard' },
          { label: 'Projeler', to: '/projects' },
          { label: 'Detay' },
        ],
      }
    }
    if (pathname === '/reports/new') {
      return {
        title: 'Yeni Rapor',
        breadcrumbs: [
          { label: 'Kontrol Paneli', to: '/dashboard' },
          { label: 'Haftalık Raporlar', to: '/reports' },
          { label: 'Yeni' },
        ],
      }
    }
    if (pathname.match(/^\/reports\/\d+\/edit$/)) {
      return {
        title: 'Rapor Düzenle',
        breadcrumbs: [
          { label: 'Kontrol Paneli', to: '/dashboard' },
          { label: 'Haftalık Raporlar', to: '/reports' },
          { label: 'Düzenle' },
        ],
      }
    }
    if (pathname.match(/^\/reports\/\d+$/)) {
      return {
        title: 'Rapor Detayı',
        breadcrumbs: [
          { label: 'Kontrol Paneli', to: '/dashboard' },
          { label: 'Haftalık Raporlar', to: '/reports' },
          { label: 'Detay' },
        ],
      }
    }
    const match = Object.keys(titleMap).find((path) => pathname.startsWith(path))
    const title = match ? titleMap[match] : 'CTO Dashboard'
    return {
      title,
      breadcrumbs: [
        { label: 'Kontrol Paneli', to: '/dashboard' },
        { label: title },
      ],
    }
  }, [pathname])
}

/**
 * Enterprise app shell: collapsible sidebar, kompakt topbar, max-width içerik.
 */
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const location = useLocation()
  const { title, breadcrumbs } = usePageMeta(location.pathname)
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          minWidth: 0,
          transition: 'width 200ms ease',
        }}
      >
        <Topbar
          title={title}
          breadcrumbs={breadcrumbs}
          sidebarWidth={sidebarWidth}
          onMenuClick={() => setMobileOpen(true)}
          onRefresh={() => window.dispatchEvent(new CustomEvent('cto:refresh'))}
        />
        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            py: { xs: 2, md: 3 },
            maxWidth: CONTENT_MAX_WIDTH,
            mx: 'auto',
            width: '100%',
          }}
          className="fade-in"
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

/** Geriye uyumluluk alias */
export const DashboardLayout = AppShell
