import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Badge, Tooltip } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { C } from '../../theme/theme';

const SIDEBAR_WIDTH = 220;
const APPBAR_HEIGHT = 56;

const NAV_ITEMS = [
  { label: 'Quote Log',    icon: <ListAltOutlinedIcon sx={{ fontSize: 18 }} />,           path: '/' },
  { label: 'New RFP',      icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />,  path: '/new-rfp' },
  { label: 'To-do List',   icon: <CheckBoxOutlinedIcon sx={{ fontSize: 18 }} />,          path: '/todo' },
  { label: 'UW Workspace', icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />,       path: '/workspace' },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f7f7' }}>

      {/* ── Top app bar ── */}
      <AppBar position="fixed" elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, height: APPBAR_HEIGHT, bgcolor: '#fcfcfc', borderBottom: '1px solid #e8e8e8', boxShadow: 'none' }}>
        <Toolbar sx={{ height: APPBAR_HEIGHT, minHeight: `${APPBAR_HEIGHT}px !important`, px: '20px', gap: '8px' }}>

          {/* Logo */}
          <Typography
            onClick={() => navigate('/')}
            sx={{ fontWeight: 700, fontSize: '15px', color: C.blue, letterSpacing: '-0.4px', mr: 'auto', cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.8 } }}>
            SLEQ
          </Typography>

          {/* Notification */}
          <Tooltip title="Notifications" placement="bottom">
            <IconButton size="small" sx={{ '&:hover': { bgcolor: '#f1f1f1' }, borderRadius: '6px', p: '6px' }}>
              <Badge badgeContent={2} color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: 15, minWidth: 15, top: 1, right: 1 } }}>
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 18, color: '#808080' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User avatar */}
          <Tooltip title="Paresh Khatri" placement="bottom">
            <Avatar
              sx={{ width: 28, height: 28, bgcolor: C.blueLightBg, color: C.blue, fontSize: '11px', fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
              PK
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Left sidebar ── */}
      <Drawer variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH, boxSizing: 'border-box',
            top: `${APPBAR_HEIGHT}px`,
            height: `calc(100% - ${APPBAR_HEIGHT}px)`,
            borderRight: '1px solid #e8e8e8',
            bgcolor: '#fcfcfc',
            pt: '8px',
          },
        }}>
        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton key={item.path} selected={active} onClick={() => navigate(item.path)}
                sx={{
                  mx: '8px', mb: '2px', px: '12px', py: '9px',
                  gap: '10px', borderRadius: '6px',
                  bgcolor: active ? '#e1eaf7 !important' : 'transparent',
                  '&:hover': { bgcolor: active ? '#e1eaf7 !important' : '#f1f1f1 !important' },
                }}>
                <ListItemIcon sx={{ minWidth: 'unset', color: active ? '#223377' : '#808080', lineHeight: 0 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: active ? 500 : 400,
                    color: active ? '#223377' : '#28313e',
                    lineHeight: 1.2,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{
        flexGrow: 1,
        mt: `${APPBAR_HEIGHT}px`,
        ml: `${SIDEBAR_WIDTH}px`,
        px: '32px',
        pt: '28px',
        pb: '40px',
        minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
        maxWidth: `calc(1440px - ${SIDEBAR_WIDTH}px)`,
        '@media (max-width: 1280px)': { px: '24px' },
      }}>
        {children}
      </Box>
    </Box>
  );
}
