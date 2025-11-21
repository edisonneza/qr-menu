import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { TextField, Button, Container, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import SignInCard from '../components/SignInCard';
import Content from '../components/Content';


export default function Login(props: { disableCustomTheme?: boolean }) {
  // const { register, handleSubmit } = useForm();
  const auth = useAuth();
  const nav = useNavigate();
  // const onSubmit = async (data:any) => {
  //   try { await auth.login(data.email, data.password); nav('/dashboard'); }
  //   catch(e){ alert('Login failed'); }
  // }
  // return (
  //   <Container>
  //     <h2>Login</h2>
  //     <form onSubmit={handleSubmit(onSubmit)}>
  //       <TextField label='Email' {...register('email')} fullWidth sx={{mb:2}} />
  //       <TextField label='Password' type='password' {...register('password')} fullWidth sx={{mb:2}} />
  //       <Button type='submit' variant='contained'>Login</Button>
  //     </form>
  //   </Container>
  // );

  useEffect(() => {
    if (auth.token)
      return nav('/admin/dashboard');

  }, [auth.token]);


  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Stack
        direction="column"
        component="main"
        sx={[
          {
            justifyContent: 'center',
            height: 'calc((1 - var(--template-frame-height, 0)) * 100%)',
            marginTop: 'max(40px - var(--template-frame-height, 0px), 0px)',
            minHeight: '100%',
          },
          (theme) => ({
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              zIndex: -1,
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
              backgroundRepeat: 'no-repeat',
              ...theme.applyStyles('dark', {
                backgroundImage:
                  'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
              }),
            },
          }),
        ]}
      >
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{
            justifyContent: 'center',
            gap: { xs: 6, sm: 12 },
            p: 2,
            mx: 'auto',
          }}
        >
          <Stack
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{
              justifyContent: 'center',
              gap: { xs: 6, sm: 12 },
              p: { xs: 2, sm: 4 },
              m: 'auto',
            }}
          >
            <Content />
            <SignInCard />
          </Stack>
        </Stack>
      </Stack>
    </AppTheme>
  );
}
