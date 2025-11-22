import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MenuPublic from './pages/MenuPublic';
import Products from './pages/admin/Products';
import DashboardLayout from './layout/DashboardLayout';
import { UIProvider } from './context/UIContext';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Settings from './pages/Settings';
import About from './pages/admin/About';
import Feedback from './pages/admin/Feedback';
import TermsAndConditions from './pages/TermsAndConditions';

export default function App() {
  return (
    <UIProvider>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:slug' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/termsandconditions' element={<TermsAndConditions />} />
        <Route path='/menu/:slug' element={<MenuPublic />} />

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </UIProvider>
  );
}
