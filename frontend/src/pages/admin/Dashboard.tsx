import { Navigate } from 'react-router-dom';
// import Categories from '.,/Categories';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import { useEffect } from 'react';



export default function Dashboard(props: { disableCustomTheme?: boolean }) {
  const auth = useAuth();
  const { setPageTitle } = useUI();

  useEffect(() => {
    setPageTitle('Dashboard');
  }, []);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    // <AppTheme {...props} themeComponents={xThemeComponents}>
    <>
      <h1>Dashboard Page - to be implemented</h1>
    </>
  );
}
