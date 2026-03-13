const db = require('../config/db');

class Task {
    static async createTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS Tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('todo', 'in-progress', 'review', 'done') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high') DEFAULT 'low',
        assignee_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES Projects(id),
        FOREIGN KEY (assignee_id) REFERENCES Users(id)
      )
    `;
        await db.execute(query);
    }

    static async create(projectId, title, description = '', status = 'todo', priority = 'medium', assigneeId = null) {
        const query = 'INSERT INTO Tasks (project_id, title, description, status, priority, assignee_id) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [projectId, title, description, status, priority, assigneeId]);
        return result.insertId;
    }

    static async findByProject(projectId) {
        const query = `
            SELECT t.*, u.name as assignee_name 
            FROM Tasks t 
            LEFT JOIN Users u ON t.assignee_id = u.id 
            WHERE t.project_id = ?
        `;
        const [rows] = await db.execute(query, [projectId]);
        return rows;
    }

    static async updateStatus(id, status) {
        await db.execute('UPDATE Tasks SET status = ? WHERE id = ?', [status, id]);
    }
}

Task.createTable().catch(console.error);

module.exports = Task;