import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MenuPublic from './pages/MenuPublic';
import Dashboard from './pages/Dashboard';

export default function App(){
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/menu/:slug' element={<MenuPublic/>} />
      <Route path='/dashboard/*' element={<Dashboard/>} />
    </Routes>
  );
}
