const db = require('../config/db');

class Task {
    static async createTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS Tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('todo', 'in-progress', 'review', 'done') DEFAULT 'todo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES Projects(id)
      )
    `;
        await db.execute(query);
    }

    static async create(projectId, title, status = 'todo') {
        const query = 'INSERT INTO Tasks (project_id, title, status) VALUES (?, ?, ?)';
        const [result] = await db.execute(query, [projectId, title, status]);
        return result.insertId;
    }

    static async findByProject(projectId) {
        const [rows] = await db.execute('SELECT * FROM Tasks WHERE project_id = ?', [projectId]);
        return rows;
    }

    static async updateStatus(id, status) {
        await db.execute('UPDATE Tasks SET status = ? WHERE id = ?', [status, id]);
    }
}

Task.createTable().catch(console.error);

module.exports = Task;