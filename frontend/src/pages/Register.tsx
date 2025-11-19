import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { TextField, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
export default function Register() {
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();
  const onSubmit = async (data: any) => {
    try {
      const res = await api.post('/register.php', data);
      debugger;
      if (!res.data.data.token || !res.data.data.user) { throw new Error('Invalid response'); }
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('store', JSON.stringify(res.data.data.user));
      nav('/dashboard');
    } catch (e) { alert('Registration failed'); }
  }
  return (
    <Container>
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label='Store name' {...register('tenant_name')} fullWidth sx={{ mb: 2 }} />
        <TextField label='Slug (unique)' {...register('slug')} fullWidth sx={{ mb: 2 }} />
        <TextField label='Email' {...register('email')} fullWidth sx={{ mb: 2 }} />
        <TextField label='Password' type='password' {...register('password')} fullWidth sx={{ mb: 2 }} />
        <Button type='submit' variant='contained'>Create</Button>
      </form>
    </Container>
  );
}
