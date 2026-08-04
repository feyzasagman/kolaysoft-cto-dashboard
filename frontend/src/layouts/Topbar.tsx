import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { sidebarWidth } from '@/layouts/Sidebar'

interface TopbarProps {
  title: string
  onMenuClick: () => void
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
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
        width: { md: `calc(100% - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="Menüyü aç"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 650, mr: 1, display: { xs: 'none', sm: 'block' } }}>
          {title}
        </Typography>

        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitSearch()
          }}
          placeholder="Proje veya rapor ara…"
          aria-label="Global arama"
          sx={{
            flex: 1,
            maxWidth: 420,
            '& .MuiOutlinedInput-root': {
              height: 36,
              fontSize: 14,
            },
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

        <IconButton aria-label="Bildirimler (yakında)" disabled>
          <NotificationsNoneOutlinedIcon />
        </IconButton>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip size="small" label={user.role} variant="outlined" />
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
              {user.fullName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
