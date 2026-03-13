import { pool } from '../server.js';

// Get project messages
export const getProjectMessages = async (projectId, limit = 50) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT m.*, u.name as author_name, u.avatar 
       FROM messages m 
       LEFT JOIN users u ON m.user_id = u.id 
       WHERE m.project_id = ? 
       ORDER BY m.created_at DESC 
       LIMIT ?`,
      [projectId, limit]
    );
    return rows.reverse();
  } finally {
    connection.release();
  }
};

// Create message
export const createMessage = async (projectId, userId, content, codeSnippet = null) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO messages (project_id, user_id, content, code_snippet, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [projectId, userId, content, codeSnippet]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM messages WHERE id = ?', [messageId]);
  } finally {
    connection.release();
  }
};
