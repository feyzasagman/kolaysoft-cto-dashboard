import {
  AssessmentOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  DashboardOutlined,
  FolderOutlined,
  LogoutOutlined,
  PeopleOutline,
  SettingsOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  SIDEBAR_ACTIVE_BG,
  SIDEBAR_ACTIVE_TEXT,
  SIDEBAR_BG,
  SIDEBAR_BORDER,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_MUTED,
  SIDEBAR_TEXT,
  SIDEBAR_WIDTH,
} from '@/theme/appTheme'

const navGroups = [
  {
    title: 'Genel',
    items: [
      { label: 'Kontrol Paneli', to: '/dashboard', icon: <DashboardOutlined fontSize="small" />, roles: ['ADMIN', 'CTO'] as const },
      { label: 'Projeler', to: '/projects', icon: <FolderOutlined fontSize="small" />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
    ],
  },
  {
    title: 'Operasyon',
    items: [
      { label: 'Haftalık Raporlar', to: '/reports', icon: <AssessmentOutlined fontSize="small" />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
      { label: 'Kullanıcılar', to: '/users', icon: <PeopleOutline fontSize="small" />, roles: ['ADMIN', 'CTO'] as const },
      { label: 'Ayarlar', to: '/settings', icon: <SettingsOutlined fontSize="small" />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
    ],
  },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { user, hasAnyRole, logout } = useAuth()
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  const content = (compact: boolean) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SIDEBAR_BG,
        color: SIDEBAR_TEXT,
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
        width,
        transition: 'width 200ms ease',
      }}
    >
      <Toolbar sx={{ px: compact ? 1 : 2, minHeight: 56, gap: 1.25, justifyContent: compact ? 'center' : 'flex-start' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: '#0969DA',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          K
        </Box>
        {!compact && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" sx={{ color: SIDEBAR_MUTED, fontWeight: 700, letterSpacing: 0.6 }}>
              KOLAYSOFT
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#F0F6FC', lineHeight: 1.2 }} noWrap>
              CTO Dashboard
            </Typography>
          </Box>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: SIDEBAR_BORDER }} />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {navGroups.map((group) => {
          const items = group.items.filter((item) => hasAnyRole(...item.roles))
          if (items.length === 0) return null
          return (
            <Box key={group.title} sx={{ px: compact ? 0.75 : 1.25, mb: 1.5 }}>
              {!compact && (
                <Typography
                  variant="caption"
                  sx={{ px: 1.25, mb: 0.5, display: 'block', color: SIDEBAR_MUTED, fontWeight: 700 }}
                >
                  {group.title}
                </Typography>
              )}
              <List disablePadding>
                {items.map((item) => {
                  const button = (
                    <ListItemButton
                      key={item.to}
                      component={NavLink}
                      to={item.to}
                      onClick={onClose}
                      sx={{
                        borderRadius: 1,
                        mb: 0.25,
                        py: 0.75,
                        px: compact ? 1 : 1.5,
                        justifyContent: compact ? 'center' : 'flex-start',
                        color: SIDEBAR_TEXT,
                        borderLeft: '2px solid transparent',
                        '&.active': {
                          bgcolor: SIDEBAR_ACTIVE_BG,
                          color: SIDEBAR_ACTIVE_TEXT,
                          borderLeftColor: SIDEBAR_ACTIVE_TEXT,
                        },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: compact ? 0 : 32, justifyContent: 'center' }}>
                        {item.icon}
                      </ListItemIcon>
                      {!compact && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        />
                      )}
                    </ListItemButton>
                  )
                  return compact ? (
                    <Tooltip key={item.to} title={item.label} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  )
                })}
              </List>
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ borderColor: SIDEBAR_BORDER }} />
      <Box sx={{ p: compact ? 1 : 1.5 }}>
        {!compact && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#0969DA', fontSize: 12 }}>
              {(user?.fullName ?? 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 650, color: '#F0F6FC' }}>
                {user?.fullName ?? 'Kullanıcı'}
              </Typography>
              <Typography noWrap sx={{ fontSize: 11, color: SIDEBAR_MUTED }}>
                {user?.role ?? '—'}
              </Typography>
            </Box>
          </Box>
        )}
        <StackRow>
          <Tooltip title={compact ? 'Genişlet' : 'Daralt'} placement="right">
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              aria-label={compact ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
              sx={{
                color: SIDEBAR_TEXT,
                display: { xs: 'none', md: 'inline-flex' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {compact ? <ChevronRightOutlined fontSize="small" /> : <ChevronLeftOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
          <ListItemButton
            onClick={() => {
              logout()
              window.location.assign('/login')
            }}
            aria-label="Çıkış yap"
            sx={{
              borderRadius: 1,
              color: SIDEBAR_TEXT,
              py: 0.75,
              justifyContent: compact ? 'center' : 'flex-start',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: compact ? 0 : 32, justifyContent: 'center' }}>
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            {!compact && (
              <ListItemText primary="Çıkış yap" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
            )}
          </ListItemButton>
        </StackRow>
      </Box>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: width }, flexShrink: { md: 0 } }} aria-label="Ana menü">
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 0 },
        }}
      >
        {content(false)}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width,
            border: 0,
            overflowX: 'hidden',
            transition: 'width 200ms ease',
          },
        }}
      >
        {content(collapsed)}
      </Drawer>
    </Box>
  )
}

function StackRow({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexDirection: 'column' }}>
      {children}
    </Box>
  )
}
