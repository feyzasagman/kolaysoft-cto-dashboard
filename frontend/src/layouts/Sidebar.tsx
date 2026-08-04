import {
  AssessmentOutlined,
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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  SIDEBAR_ACTIVE_BG,
  SIDEBAR_ACTIVE_TEXT,
  SIDEBAR_BG,
  SIDEBAR_BORDER,
  SIDEBAR_MUTED,
  SIDEBAR_TEXT,
} from '@/theme/appTheme'

const DRAWER_WIDTH = 260

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlined fontSize="small" />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Projeler', to: '/projects', icon: <FolderOutlined fontSize="small" />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Haftalık Raporlar', to: '/reports', icon: <AssessmentOutlined fontSize="small" />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
  { label: 'Kullanıcılar', to: '/users', icon: <PeopleOutline fontSize="small" />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Ayarlar', to: '/settings', icon: <SettingsOutlined fontSize="small" />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user, hasAnyRole, logout } = useAuth()

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SIDEBAR_BG,
        color: SIDEBAR_TEXT,
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
      }}
    >
      <Toolbar sx={{ px: 2.25, minHeight: 64 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ letterSpacing: 1.4, color: SIDEBAR_MUTED, fontWeight: 700 }}
          >
            KOLAYSOFT
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#F0F6FC' }}>
            CTO Dashboard
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: SIDEBAR_BORDER }} />

      <List sx={{ flex: 1, px: 1.25, py: 1.5 }}>
        {navItems
          .filter((item) => hasAnyRole(...item.roles))
          .map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={onClose}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: SIDEBAR_TEXT,
                borderLeft: '3px solid transparent',
                pl: 1.25,
                '&.active': {
                  bgcolor: SIDEBAR_ACTIVE_BG,
                  color: SIDEBAR_ACTIVE_TEXT,
                  borderLeftColor: SIDEBAR_ACTIVE_TEXT,
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
      </List>

      <Divider sx={{ borderColor: SIDEBAR_BORDER }} />

      <Box sx={{ px: 2, py: 1.75 }}>
        <StackProfile
          name={user?.fullName ?? 'Kullanıcı'}
          role={user?.role ?? '—'}
          onLogout={() => {
            logout()
            window.location.assign('/login')
          }}
        />
      </Box>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0 },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0 },
        }}
      >
        {content}
      </Drawer>
    </Box>
  )
}

function StackProfile({
  name,
  role,
  onLogout,
}: {
  name: string
  role: string
  onLogout: () => void
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1F6F54', fontSize: 14 }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 13, fontWeight: 650, color: '#F0F6FC' }}>
            {name}
          </Typography>
          <Typography noWrap sx={{ fontSize: 11, color: SIDEBAR_MUTED }}>
            {role}
          </Typography>
        </Box>
      </Box>
      <ListItemButton
        onClick={onLogout}
        aria-label="Çıkış yap"
        sx={{
          borderRadius: 1.5,
          color: SIDEBAR_TEXT,
          px: 1,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
          <LogoutOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Çıkış yap"
          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
        />
      </ListItemButton>
    </Box>
  )
}

export const sidebarWidth = DRAWER_WIDTH
