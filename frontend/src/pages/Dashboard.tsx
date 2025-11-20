import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Categories from './Categories';
import Products from './Products';
import Settings from './Settings';
import { useAuth } from '../hooks/useAuth';
export default function Dashboard() {
  const auth = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <nav style={{ width: 220, padding: 20 }}>
        <Link to=''>Home</Link><br />
        <Link to='categories'>Categories</Link><br />
        <Link to='products'>Products</Link><br />
        <Link to='settings'>Settings</Link><br />
        <button
          style={{ marginTop: 20 }}
          onClick={() => auth.logout()}
        >
          Logout
        </button>
      </nav>
      <main style={{ flex: 1, padding: 20 }}>
        <Routes>
          <Route path='' element={<div>Dashboard home</div>} />
          <Route path='categories' element={<Categories />} />
          <Route path='products' element={<Products />} />
          <Route path='settings' element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
