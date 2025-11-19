import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { TextField, Button } from '@mui/material';
export default function Categories(){
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const load = async ()=>{ const r = await api.get('/categories.php'); setList(r.data); }
  useEffect(()=>{ load(); },[]);
  const add = async ()=>{ await api.post('/categories.php', { name }); setName(''); load(); }
  return (
    <div>
      <h3>Categories</h3>
      <div><TextField value={name} onChange={e=>setName(e.target.value)} label='Name'/> <Button onClick={add}>Add</Button></div>
      <ul>{list.map(c=> <li key={c.id}>{c.name}</li>)}</ul>
    </div>
  );
}
