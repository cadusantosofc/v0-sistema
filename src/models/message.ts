import { RowDataPacket } from 'mysql2';
import { pool } from '../lib/db';
import { updateChatTimestamp } from './chat';

interface Message extends RowDataPacket {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: Date;
}

interface CreateMessageData {
  chat_id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
}

// Criar nova mensagem
export async function createMessage(data: CreateMessageData): Promise<Message> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insere mensagem
    const [result] = await connection.execute(
      `INSERT INTO messages (chat_id, sender_id, content, status)
       VALUES (?, ?, ?, ?)`,
      [data.chat_id, data.sender_id, data.content, data.status]
    );

    const insertId = (result as any).insertId;

    // Atualiza timestamp do chat
    await updateChatTimestamp(data.chat_id);

    await connection.commit();

    // Busca mensagem criada
    const [message] = await connection.query<Message[]>(
      'SELECT * FROM messages WHERE id = ?',
      [insertId]
    );

    return message[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Buscar mensagens por chat
export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const [messages] = await pool.query<Message[]>(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
    [chatId]
  );

  return messages;
}

// Atualizar status da mensagem
export async function updateMessageStatus(id: string, status: 'delivered' | 'read'): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE messages SET status = ? WHERE id = ?',
    [status, id]
  );

  return (result as any).affectedRows > 0;
}

// Marcar todas as mensagens do chat como lidas
export async function markChatMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
  const [result] = await pool.execute(
    `UPDATE messages 
     SET status = 'read' 
     WHERE chat_id = ? 
     AND sender_id != ? 
     AND status != 'read'`,
    [chatId, userId]
  );

  return (result as any).affectedRows > 0;
}
