import { pool } from '../server.js';

// Get user by ID
export const getUserById = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT id, name, email, avatar, plan, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

// Create user
export const createUser = async (name, email, passwordHash) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, plan, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, passwordHash, 'free']
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE users SET ? WHERE id = ?',
      [updates, userId]
    );
  } finally {
    connection.release();
  }
};
