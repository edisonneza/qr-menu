import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MenuPublic from './pages/MenuPublic';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/:slug' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/menu/:slug' element={<MenuPublic />} />
      <Route path='/dashboard/*' element={<ProtectedRoute children={<Dashboard />} />} />
    </Routes>
  );
}
