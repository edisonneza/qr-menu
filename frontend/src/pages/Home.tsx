import React from 'react';
import { Container, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
export default function Home(){
  return (
    <Container sx={{mt:4}}>
      <Typography variant='h3'>Create your restaurant menu</Typography>
      <Typography sx={{my:2}}>Fast, multi-tenant menus with QR codes.</Typography>
      <Button component={Link} to="/register" variant="contained" sx={{mr:2}}>Create My Menu</Button>
      <Button component={Link} to="/pricing" variant="outlined">Pricing</Button>
    </Container>
  );
}
