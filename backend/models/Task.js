import { pool } from '../server.js';

// Get all tasks in a project
export const getProjectTasks = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT t.*, u.name as assigned_to_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.project_id = ? 
       ORDER BY t.status, t.created_at`,
      [projectId]
    );
    return rows;
  } finally {
    connection.release();
  }
};

// Get task by ID
export const getTaskById = async (taskId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

// Create task
export const createTask = async (projectId, title, description, status = 'todo', priority = 'medium') => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [projectId, title, description, status, priority]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Update task
export const updateTask = async (taskId, updates) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE tasks SET ? WHERE id = ?',
      [updates, taskId]
    );
  } finally {
    connection.release();
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM tasks WHERE id = ?', [taskId]);
  } finally {
    connection.release();
  }
};
