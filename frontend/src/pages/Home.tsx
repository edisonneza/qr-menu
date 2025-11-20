import React from 'react';
import { Container, Button, Typography, CssBaseline } from '@mui/material';
import { Link, useParams } from 'react-router-dom';

import Divider from '@mui/material/Divider';
import AppTheme from '../theme/AppTheme';
import AppAppBar from '../components/home/AppAppBar';
import Hero from '../components/home/Hero';
import LogoCollection from '../components/home/LogoCollection';
import Highlights from '../components/home/Highlights';
import Pricing from '../components/home/Pricing';
import Features from '../components/home/Features';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import Footer from '../components/home/Footer';
import TenantProducts from '../components/tenant/TenantProducts';

export default function Home(props: { disableCustomTheme?: boolean }) {
  // return (
  //   <Container sx={{mt:4}}>
  //     <Typography variant='h3'>Create your restaurant menu</Typography>
  //     <Typography sx={{my:2}}>Fast, multi-tenant menus with QR codes.</Typography>
  //     <Button component={Link} to="/register" variant="contained" sx={{mr:2}}>Create My Menu</Button>
  //     <Button component={Link} to="/pricing" variant="outlined">Pricing</Button>
  //   </Container>
  // );
  const { slug } = useParams();
  if (!!slug && slug?.trim() != '') {
    return (<AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <TenantProducts slug={slug} />
      <Footer />
    </AppTheme>
    )
  }

  return (<AppTheme {...props}>
    <CssBaseline enableColorScheme />

    <AppAppBar />
    <Hero />
    <div>
      <LogoCollection />
      <Features />
      <Divider />
      <Testimonials />
      <Divider />
      <Highlights />
      <Divider />
      <Pricing />
      <Divider />
      <FAQ />
      <Divider />
      <Footer />
    </div>
  </AppTheme>
  )
}
