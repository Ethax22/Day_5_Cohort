import { pool } from '../server.js';

// Get all projects for user (owned + collaborated)
export const getUserProjects = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [ownedProjects] = await connection.query(
      `SELECT p.*, COUNT(DISTINCT pc.user_id) as collaborator_count 
       FROM projects p 
       LEFT JOIN project_collaborators pc ON p.id = pc.project_id 
       WHERE p.owner_id = ? 
       GROUP BY p.id`,
      [userId]
    );

    const [collaboratedProjects] = await connection.query(
      `SELECT p.*, COUNT(DISTINCT pc.user_id) as collaborator_count 
       FROM projects p 
       INNER JOIN project_collaborators pc ON p.id = pc.project_id 
       WHERE pc.user_id = ? 
       GROUP BY p.id`,
      [userId]
    );

    return { ownedProjects, collaboratedProjects };
  } finally {
    connection.release();
  }
};

// Get project by ID
export const getProjectById = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p 
       LEFT JOIN users u ON p.owner_id = u.id 
       WHERE p.id = ?`,
      [projectId]
    );
    return rows[0];
  } finally {
    connection.release();
  }
};

// Create project
export const createProject = async (name, description, ownerId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO projects (name, description, owner_id, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [name, description, ownerId]
    );
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Update project
export const updateProject = async (projectId, updates) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE projects SET ? WHERE id = ?',
      [updates, projectId]
    );
  } finally {
    connection.release();
  }
};

// Delete project
export const deleteProject = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
  } finally {
    connection.release();
  }
};

// Add collaborator
export const addCollaborator = async (projectId, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'INSERT INTO project_collaborators (project_id, user_id) VALUES (?, ?)',
      [projectId, userId]
    );
  } finally {
    connection.release();
  }
};

// Get project collaborators
export const getProjectCollaborators = async (projectId) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT u.id, u.name, u.email, u.avatar 
       FROM users u 
       INNER JOIN project_collaborators pc ON u.id = pc.user_id 
       WHERE pc.project_id = ?`,
      [projectId]
    );
    return rows;
  } finally {
    connection.release();
  }
};
