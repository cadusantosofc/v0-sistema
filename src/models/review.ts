import { pool } from '../lib/db';
import { Review } from './types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { randomUUID } from 'crypto';

// Criar uma nova avaliação
export async function createReview(review: Omit<Review, 'id' | 'status' | 'created_at'>): Promise<Review> {
  const reviewId = randomUUID();
  const connection = await pool.getConnection();
  
  try {
    await connection.execute<ResultSetHeader>(
      `INSERT INTO reviews (id, job_id, reviewer_id, reviewed_id, rating, comment, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [reviewId, review.job_id, review.reviewer_id, review.reviewed_id, review.rating, review.comment]
    );

    const [reviews] = await connection.execute<(Review & RowDataPacket)[]>(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId]
    );

    return reviews[0];
  } finally {
    connection.release();
  }
}

// Buscar avaliação por ID
export async function getReviewById(id: string): Promise<Review | null> {
  const [reviews] = await pool.execute<(Review & RowDataPacket)[]>(
    'SELECT * FROM reviews WHERE id = ? AND status = "active"',
    [id]
  );

  return reviews[0] || null;
}

// Buscar avaliações por usuário avaliado
export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  const [reviews] = await pool.execute<(Review & RowDataPacket)[]>(
    'SELECT * FROM reviews WHERE reviewed_id = ? AND status = "active" ORDER BY created_at DESC',
    [userId]
  );

  return reviews;
}

// Buscar avaliações por vaga
export async function getReviewsByJobId(jobId: string): Promise<Review[]> {
  const [reviews] = await pool.execute<(Review & RowDataPacket)[]>(
    'SELECT * FROM reviews WHERE job_id = ? AND status = "active" ORDER BY created_at DESC',
    [jobId]
  );

  return reviews;
}

// Verificar se um usuário já avaliou uma vaga
export async function hasUserReviewedJob(reviewerId: string, jobId: string): Promise<boolean> {
  const [reviews] = await pool.execute<(Review & RowDataPacket)[]>(
    'SELECT * FROM reviews WHERE reviewer_id = ? AND job_id = ? AND status = "active"',
    [reviewerId, jobId]
  );

  return reviews.length > 0;
}

// Calcular média de avaliações de um usuário
export async function getUserAverageRating(userId: string): Promise<number> {
  const [result] = await pool.execute<RowDataPacket[]>(
    'SELECT AVG(rating) as average FROM reviews WHERE reviewed_id = ? AND status = "active"',
    [userId]
  );

  return result[0]?.average || 0;
}

// Atualizar avaliação
export async function updateReview(id: string, data: Partial<Review>): Promise<Review | null> {
  const allowedFields = ['rating', 'comment'];
  const updates = Object.entries(data)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key]) => `${key} = ?`);

  if (updates.length === 0) return null;

  const values = Object.entries(data)
    .filter(([key]) => allowedFields.includes(key))
    .map(([_, value]) => value);

  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    const [reviews] = await connection.execute<(Review & RowDataPacket)[]>(
      'SELECT * FROM reviews WHERE id = ?',
      [id]
    );

    return reviews[0] || null;
  } finally {
    connection.release();
  }
}

// Excluir avaliação (soft delete)
export async function deleteReview(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE reviews SET status = "deleted" WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
} 