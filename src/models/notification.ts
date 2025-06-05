import { pool } from '../lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { randomUUID } from 'crypto';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: string | null;
  related_type?: string | null;
  created_at: Date;
}

export interface NotificationInput {
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: string | null;
  related_type?: string | null;
}

/**
 * Cria uma nova notificação
 * @param data Dados da notificação
 * @returns A notificação criada
 */
export async function createNotification(data: NotificationInput): Promise<Notification> {
  const id = randomUUID();
  const now = new Date();
  
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO notifications (
      id, user_id, title, message, type, is_read, related_id, related_type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.user_id,
      data.title,
      data.message,
      data.type,
      data.is_read ? 1 : 0,
      data.related_id || null,
      data.related_type || null,
      now
    ]
  );
  
  return {
    id,
    user_id: data.user_id,
    title: data.title,
    message: data.message,
    type: data.type,
    is_read: data.is_read,
    related_id: data.related_id || null,
    related_type: data.related_type || null,
    created_at: now
  };
}

/**
 * Busca notificações de um usuário
 * @param userId ID do usuário
 * @returns Lista de notificações
 */
export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  const [notifications] = await pool.execute<(Notification & RowDataPacket)[]>(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [userId]
  );
  
  return notifications.map(notification => ({
    ...notification,
    is_read: Boolean(notification.is_read)
  }));
}

/**
 * Marca uma notificação como lida ou não lida
 * @param id ID da notificação
 * @param isRead Status de leitura
 * @returns Sucesso da operação
 */
export async function markNotificationAsRead(id: string, isRead: boolean): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE notifications SET is_read = ? WHERE id = ?',
    [isRead ? 1 : 0, id]
  );
  
  return result.affectedRows > 0;
}

/**
 * Exclui uma notificação
 * @param id ID da notificação
 * @returns Sucesso da operação
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM notifications WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
}

/**
 * Exclui todas as notificações de um usuário
 * @param userId ID do usuário
 * @returns Sucesso da operação
 */
export async function deleteAllUserNotifications(userId: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM notifications WHERE user_id = ?',
    [userId]
  );
  
  return result.affectedRows > 0;
}

/**
 * Marca todas as notificações de um usuário como lidas
 * @param userId ID do usuário
 * @returns Sucesso da operação
 */
export async function markAllUserNotificationsAsRead(userId: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [userId]
  );
  
  return result.affectedRows > 0;
} 