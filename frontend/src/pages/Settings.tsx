import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { TextField, Button } from '@mui/material';
// import QRCodeGenerator from '../components/QRCodeGenerator';
export default function Settings(){
  const [store, setStore] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(()=>{ const s = localStorage.getItem('store'); if(s){ setStore(JSON.parse(s)); setName(JSON.parse(s).name); setPhone(JSON.parse(s).phone||''); } },[]);
  const save = async ()=>{ await api.post('/settings.php', { name, phone, logo: '' }); alert('Saved'); }
  const [qrUrl, setQrUrl] = useState('');
  useEffect(()=>{ if(store) api.get(`/qrcode.php?slug=${store.slug}`).then(r=>setQrUrl(r.data.url)); },[store]);
  return (
    <div>
      <h3>Settings</h3>
      <div>
        <TextField label='Store name' value={name} onChange={e=>setName(e.target.value)} sx={{mb:2}} fullWidth/>
        <TextField label='Phone (WhatsApp)' value={phone} onChange={e=>setPhone(e.target.value)} sx={{mb:2}} fullWidth/>
        <Button onClick={save} variant='contained'>Save</Button>
      </div>
      {/* {qrUrl && <div style={{marginTop:20}}><h4>Menu QR</h4><QRCodeGenerator url={qrUrl} /></div>} */}
    </div>
  );
}
