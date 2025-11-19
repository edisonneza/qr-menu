import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Categories from './Categories';
import Products from './Products';
import Settings from './Settings';
export default function Dashboard(){
  return (
    <div style={{display:'flex'}}>
      <nav style={{width:220, padding:20}}>
        <Link to=''>Home</Link><br/>
        <Link to='categories'>Categories</Link><br/>
        <Link to='products'>Products</Link><br/>
        <Link to='settings'>Settings</Link><br/>
      </nav>
      <main style={{flex:1, padding:20}}>
        <Routes>
          <Route path='' element={<div>Dashboard home</div>} />
          <Route path='categories' element={<Categories/>} />
          <Route path='products' element={<Products/>} />
          <Route path='settings' element={<Settings/>} />
        </Routes>
      </main>
    </div>
  );
}
