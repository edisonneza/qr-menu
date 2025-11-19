import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { TextField, Button } from '@mui/material';
export default function Products(){
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const load = async ()=>{ const r = await api.get('/products.php'); setList(r.data); }
  useEffect(()=>{ load(); },[]);
  const add = async ()=>{ await api.post('/products.php', { name, price: parseFloat(String(price)||'0'), description:'', category_id:null, image:null, variants:null }); setName(''); setPrice(''); load(); }
  return (
    <div>
      <h3>Products</h3>
      <div>
        <TextField value={name} onChange={e=>setName(e.target.value)} label='Name' sx={{mr:1}} />
        <TextField type='number' value={price} onChange={e=>setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} label='Price' sx={{mr:1}} />
        <Button onClick={add}>Add</Button>
      </div>
      <ul>{list.map(p=> <li key={p.id}>{p.name} - {p.price}</li>)}</ul>
    </div>
  );
}
