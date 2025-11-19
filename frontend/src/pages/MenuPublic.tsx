import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Container, Grid, Card, CardContent, Typography, Select, MenuItem } from '@mui/material';
import WhatsAppOrderButton from '../components/WhatsAppOrderButton';

const MenuPublic:React.FC = () => {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(()=>{
    if(!slug) return;
    api.get(`/menu.php?slug=${slug}`).then(r=>{
      setStore(r.data.store);
      const prods = r.data.products || [];
      setProducts(prods);
      const cats = Array.from(new Set(prods.map((p:any)=>p.category_name || 'Uncategorized')));
      setCategories(cats);
    }).catch(console.error);
  },[slug]);

  const filtered = selectedCategory ? products.filter(p => (p.category_name || 'Uncategorized') === selectedCategory) : products;

  return (
    <Container>
      <Typography variant='h4' sx={{mt:4}}>{store?.name}</Typography>
      <Select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} displayEmpty sx={{my:2}}>
        <MenuItem value=''>All</MenuItem>
        {categories.map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </Select>
      <Grid container spacing={2}>
        {filtered.map(p=> (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant='h6'>{p.name} — {p.price} {store?.currency ?? '€'}</Typography>
                <Typography variant='body2'>{p.description}</Typography>
                <div style={{marginTop:8}}>
                  <WhatsAppOrderButton phone={store?.phone} message={`Hello, I want to order: ${p.name}`} />
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
export default MenuPublic;
