import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { TextField, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
export default function Login(){
  const { register, handleSubmit } = useForm();
  const auth = useAuth();
  const nav = useNavigate();
  const onSubmit = async (data:any) => {
    try { await auth.login(data.email, data.password); nav('/dashboard'); }
    catch(e){ alert('Login failed'); }
  }
  return (
    <Container>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label='Email' {...register('email')} fullWidth sx={{mb:2}} />
        <TextField label='Password' type='password' {...register('password')} fullWidth sx={{mb:2}} />
        <Button type='submit' variant='contained'>Login</Button>
      </form>
    </Container>
  );
}
