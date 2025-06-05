import { pool, query } from '../lib/db';
import { User } from './types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function createUser(user: Omit<User, 'created_at'>): Promise<User> {
  try {
    await query(
      `INSERT INTO users (id, name, email, password, role, avatar, phone, bio, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.name, user.email, user.password, user.role, user.avatar, user.phone, user.bio, user.category]
    );

    const newUser = await query(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    ) as (User & RowDataPacket)[];

    return newUser[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as (User & RowDataPacket)[];

    return users[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log('Iniciando getUserByEmail...');
  try {
    console.log('Buscando usuário por email:', email);
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as (User & RowDataPacket)[];
    
    console.log('Query executada, resultado:', users);
    console.log('Resultado da busca:', { found: users.length > 0, user: users[0] });
    return users[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  console.log('Iniciando updateUser para ID:', id);
  console.log('Campos recebidos:', Object.keys(data));
  
  const allowedFields = ['name', 'email', 'avatar', 'phone', 'bio', 'category', 'document'];
  const updates = Object.entries(data)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key, value]) => `${key} = ?`);

  if (updates.length === 0) {
    console.log('Nenhum campo válido para atualização');
    return null;
  }

  const values = Object.entries(data)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key, value]) => {
      // Verificar se é um avatar base64 muito grande para log
      if (key === 'avatar' && typeof value === 'string' && value.length > 200) {
        console.log('Avatar base64 recebido (truncado):', value.substring(0, 100) + '...');
        return value;
      }
      return value;
    });

  try {
    console.log('Executando query de atualização...');
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    console.log('Atualização realizada com sucesso');

    const users = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as (User & RowDataPacket)[];

    console.log('Usuário atualizado:', users[0] ? 'encontrado' : 'não encontrado');
    return users[0] || null;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function listUsers(role?: User['role']): Promise<User[]> {
  try {
    if (role) {
      const users = await query(
        'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC',
        [role]
      ) as (User & RowDataPacket)[];
      return users;
    }

    const users = await query(
      'SELECT * FROM users ORDER BY created_at DESC'
    ) as (User & RowDataPacket)[];
    return users;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  }
}
