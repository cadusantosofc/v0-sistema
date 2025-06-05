import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types';

const usersFile = path.join(process.cwd(), 'data', 'users.txt');

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const content = await fs.readFile(usersFile, 'utf-8');
    const users = content.split('\n').filter(Boolean).map(line => JSON.parse(line));
    const user = users.find(u => u.email === email);
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const id = uuidv4();
  const user: User = { ...userData, id };
  
  try {
    await fs.appendFile(usersFile, JSON.stringify(user) + '\n');
    return user;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const content = await fs.readFile(usersFile, 'utf-8');
    const users = content.split('\n').filter(Boolean).map(line => JSON.parse(line));
    const user = users.find(u => u.id === id);
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
