import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { SIDEBAR_WIDTH } from '@/theme/appTheme'

interface TopbarProps {
  title: string
  breadcrumbs?: Array<{ label: string; to?: string }>
  onMenuClick: () => void
  onRefresh?: () => void
}

export function Topbar({ title, breadcrumbs = [], onMenuClick, onRefresh }: TopbarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    navigate(`/dashboard?search=${encodeURIComponent(q)}`)
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ gap: 1.25, minHeight: 56, px: { xs: 1.5, md: 2.5 } }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="Menüyü aç"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ minWidth: 0, mr: 1 }}>
          {breadcrumbs.length > 0 ? (
            <Breadcrumbs aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.75 } }}>
              {breadcrumbs.map((crumb) =>
                crumb.to ? (
                  <Link
                    key={crumb.label}
                    component={RouterLink}
                    to={crumb.to}
                    underline="hover"
                    color="text.secondary"
                    variant="caption"
                    fontWeight={600}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <Typography key={crumb.label} variant="caption" fontWeight={650} color="text.primary">
                    {crumb.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>
          ) : (
            <Typography variant="subtitle1" noWrap>
              {title}
            </Typography>
          )}
        </Box>

        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitSearch()
          }}
          placeholder="Proje ara…"
          aria-label="Global arama"
          sx={{
            flex: 1,
            maxWidth: 360,
            display: { xs: 'none', sm: 'block' },
            '& .MuiOutlinedInput-root': { height: 32 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" htmlColor="#656D76" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {onRefresh && (
          <IconButton onClick={onRefresh} aria-label="Yenile" size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton aria-label="Bildirimler (yakında)" disabled size="small">
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </IconButton>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size="small" label={user.role} variant="outlined" />
            <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: 12 }}>
              {user.fullName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
