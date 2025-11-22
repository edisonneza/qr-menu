import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import { useEffect } from 'react';


export default function Categories(props: { disableCustomTheme?: boolean }) {
  const auth = useAuth();
  const { setPageTitle } = useUI();

  useEffect(() => {
    setPageTitle('Dashboard');
  }, []);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <h1>Dashboard Page - to be implemented</h1>
    </>
  );
}
