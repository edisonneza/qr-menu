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
import NotificationProvider from './hooks/useNotifications/NotificationsProviders';
import DialogProvider from './hooks/useDialogs/DialogsProvider';
import UserList from './pages/admin/users/UserList';
import UserView from './pages/admin/users/UserView';
import UserCreateEdit from './pages/admin/users/UserCreateEdit';
import RoleList from './pages/admin/roles/RoleList';
import RoleView from './pages/admin/roles/RoleView';
import RoleEdit from './pages/admin/roles/RoleEdit';
import RoleEditDetails from './pages/admin/roles/RoleEditDetails';
import { useTokenExpirationCheck } from './hooks/useTokenExpirationCheck';

export default function App() {
  // Check for token expiration every minute
  useTokenExpirationCheck(60000);
  return (
    <UIProvider>
      <NotificationProvider>
        <DialogProvider>
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
              
              {/* User Management Routes */}
              <Route path="users" element={<UserList />} />
              <Route path="users/:userId" element={<UserView />} />
              <Route path="users/new" element={<UserCreateEdit />} />
              <Route path="users/:userId/edit" element={<UserCreateEdit />} />
              
              {/* Role Management Routes */}
              <Route path="roles" element={<RoleList />} />
              <Route path="roles/:roleId" element={<RoleView />} />
              <Route path="roles/:roleId/edit" element={<RoleEdit />} />
              <Route path="roles/:roleId/edit-details" element={<RoleEditDetails />} />
            </Route>
          </Routes>
        </DialogProvider>
      </NotificationProvider>
    </UIProvider>
  );
}
