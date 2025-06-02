import fs from 'fs/promises';
import path from 'path';

const WALLET_FILE = path.join(process.cwd(), 'data', 'wallets', 'users.txt');

export async function ensureFileExists() {
  try {
    await fs.access(WALLET_FILE);
  } catch {
    await fs.writeFile(WALLET_FILE, '');
  }
}

export async function getBalance(userId: string): Promise<number> {
  await ensureFileExists();
  try {
    const data = await fs.readFile(WALLET_FILE, 'utf-8');
    const users = data.split('\n');
    
    for (const user of users) {
      if (!user.trim()) continue;
      const [id, balance] = user.split('|');
      if (id === userId) {
        return Number(balance) || 0;
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function updateBalance(userId: string, amount: number): Promise<boolean> {
  await ensureFileExists();
  try {
    let data = await fs.readFile(WALLET_FILE, 'utf-8');
    let users = data.split('\n').filter(Boolean);
    let userFound = false;
    
    users = users.map(user => {
      const [id, balance] = user.split('|');
      if (id === userId) {
        userFound = true;
        const newBalance = (Number(balance) || 0) + amount;
        return `${id}|${newBalance.toFixed(2)}`;
      }
      return user;
    });

    if (!userFound) {
      users.push(`${userId}|${amount.toFixed(2)}`);
    }

    await fs.writeFile(WALLET_FILE, users.join('\n') + '\n');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    return false;
  }
}
