import { Pool } from 'pg';
import type { Post, PostCreate, User } from './models.js';
import { NotFoundError, InternalError } from '../errors.js';
import { PostgresExternalService } from '@skip-adapter/postgres';

const dbConfig = {
  user: 'skipper',
  host: 'localhost',
  database: 'skipdb',
  password: 'skipper123',
  port: 5432,
};
const pool = new Pool(dbConfig);

export const postgresExternalService = new PostgresExternalService(dbConfig);

export async function getUsers(): Promise<User[]> {
  const result = await pool.query('SELECT * FROM users');
  if (!Array.isArray(result.rows)) {
    throw new InternalError('Database returned invalid user data');
  }
  return result.rows;
}

export async function getUserById(id: string): Promise<User> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid user ID format');
  }
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!result.rows[0]) {
    throw new NotFoundError(`User not found: ${id}`);
  }

  return result.rows[0];
}

export async function getPostById(id: string): Promise<Post> {
  if (!/^\d+$/.test(id)) {
    throw new InternalError('Invalid post ID format');
  }
  const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  if (!result.rows[0]) {
    throw new NotFoundError(`Post not found: ${id}`);
  }
  return result.rows[0];
}

export async function createPost(post: PostCreate): Promise<Post> {
  const result = await pool.query(
    'INSERT INTO posts (title, content, author_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [post.title, post.content, post.author_id, post.status]
  );
  return result.rows[0];
}

export async function publishPost(id: string): Promise<Post> {
  const publishedAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const result = await pool.query(
    'UPDATE posts SET status = $1, published_at = $2, updated_at = $3 WHERE id = $4 RETURNING *',
    ['published', publishedAt, updatedAt, id]
  );
  return result.rows[0];
}

export async function unpublishPost(id: string): Promise<Post> {
  const updatedAt = new Date().toISOString();
  const result = await pool.query(
    'UPDATE posts SET status = $1, published_at = NULL, updated_at = $2 WHERE id = $3 RETURNING *',
    ['draft', updatedAt, id]
  );
  return result.rows[0];
}

export async function deletePost(id: string): Promise<void> {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}
