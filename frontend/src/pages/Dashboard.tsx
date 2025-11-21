import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Categories from './Categories';
import Products from './Products';
import Settings from './Settings';
import { useAuth } from '../hooks/useAuth';
import AppTheme from '../theme/AppTheme';
import { alpha, Box, CssBaseline, Stack } from '@mui/material';
import SideMenu from '../components/admin/SideMenu';
import AppNavbar from '../components/admin/AppNavBar';
import Header from '../components/admin/Header';


export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const auth = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  // return (
  //   <div style={{ display: 'flex' }}>
  //     <nav style={{ width: 220, padding: 20 }}>
  //       <Link to=''>Home</Link><br />
  //       <Link to='categories'>Categories</Link><br />
  //       <Link to='products'>Products</Link><br />
  //       <Link to='settings'>Settings</Link><br />
  //       <button
  //         style={{ marginTop: 20 }}
  //         onClick={() => auth.logout()}
  //       >
  //         Logout
  //       </button>
  //     </nav>
  //     <main style={{ flex: 1, padding: 20 }}>
  //       <Routes>
  //         <Route path='' element={<div>Dashboard home</div>} />
  //         <Route path='categories' element={<Categories />} />
  //         <Route path='products' element={<Products />} />
  //         <Route path='settings' element={<Settings />} />
  //       </Routes>
  //     </main>
  //   </div>
  // );

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
            {/* <MainGrid /> */}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
