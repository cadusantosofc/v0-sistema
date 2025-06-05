import { cookies } from 'next/headers';

export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie?.value) {
      return null;
    }

    return JSON.parse(userCookie.value);
  } catch (error) {
    console.error('Erro ao ler cookie:', error);
    return null;
  }
}
