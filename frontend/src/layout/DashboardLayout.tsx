import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppTheme from '../theme/AppTheme';
import { alpha, Box, CssBaseline, Stack } from '@mui/material';
import SideMenu from '../components/admin/SideMenu';
import AppNavbar from '../components/admin/AppNavBar';
import Header from '../components/admin/Header';
import { useUI } from '../context/UIContext';


export default function DashboardLayout(props: { disableCustomTheme?: boolean }) {
  const auth = useAuth();
  const { setPageTitle } = useUI();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    // <AppTheme {...props} themeComponents={xThemeComponents}>
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <Outlet /> {/* This is where child pages appear */}
            {/* <MainGrid /> */}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
