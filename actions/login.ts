'use server';

import axios from 'axios';
import publicApi from '@/lib/api';
import { setSessionTokens } from '@/lib/session';
import { redirect } from 'next/navigation';


export async function login( _prevState: {error:null|string}, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  try {
    const res = await publicApi.post(`/auth/login`, {
      email,
      password
    });
    await setSessionTokens(res.data.accessToken, res.data.refreshToken);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { error: error.response.data?.error || 'Erro ao fazer login' };
    }
    return { error: 'Não foi possível conectar à API. Ela está rodando?' };
  }

  // Fora do try: o redirect funciona lançando um erro interno do Next.
  redirect('/dashboard');
}
