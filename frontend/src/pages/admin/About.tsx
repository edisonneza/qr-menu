import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import { useEffect } from 'react';


export default function About(props: { disableCustomTheme?: boolean }) {
  const auth = useAuth();
  const { setPageTitle } = useUI();

  useEffect(() => {
    setPageTitle('About');
  }, []);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <h1>About Page - to be implemented</h1>
    </>
  );
}
