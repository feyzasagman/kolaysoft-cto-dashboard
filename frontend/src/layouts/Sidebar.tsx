import {
  AssessmentOutlined,
  DashboardOutlined,
  FolderOutlined,
  LogoutOutlined,
  PeopleOutline,
  SettingsOutlined,
} from '@mui/icons-material'
import {
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

const DRAWER_WIDTH = 248

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardOutlined />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Projects', to: '/projects', icon: <FolderOutlined />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Weekly Reports', to: '/reports', icon: <AssessmentOutlined />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
  { label: 'Users', to: '/users', icon: <PeopleOutline />, roles: ['ADMIN', 'CTO'] as const },
  { label: 'Settings', to: '/settings', icon: <SettingsOutlined />, roles: ['ADMIN', 'CTO', 'PROJECT_MANAGER'] as const },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { hasAnyRole, logout } = useAuth()

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#102820', color: '#E8F2EF' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ letterSpacing: 1.2, opacity: 0.7 }}>
            KOLAYSOFT
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            CTO Dashboard
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(232,242,239,0.12)' }} />
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {navItems
          .filter((item) => hasAnyRole(...item.roles))
          .map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: 'inherit',
                '&.active': {
                  bgcolor: 'rgba(61, 168, 145, 0.22)',
                  color: '#8FE0CF',
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(232,242,239,0.12)' }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton
          onClick={() => {
            logout()
            window.location.assign('/login')
          }}
          sx={{
            borderRadius: 2,
            color: 'inherit',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
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

export const sidebarWidth = DRAWER_WIDTH
