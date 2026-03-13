const db = require('../config/db');

class Message {
    static async createTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS Messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        type ENUM('text', 'code', 'file') DEFAULT 'text',
        language VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES Projects(id),
        FOREIGN KEY (sender_id) REFERENCES Users(id)
      )
    `;
        await db.execute(query);
    }

    static async create(projectId, senderId, content, type = 'text', language = null) {
        const query = 'INSERT INTO Messages (project_id, sender_id, content, type, language) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [projectId, senderId, content, type, language]);
        
        // Fetch the created message with sender info
        const [rows] = await db.execute(`
            SELECT m.*, u.name as sender_name 
            FROM Messages m 
            JOIN Users u ON m.sender_id = u.id 
            WHERE m.id = ?
        `, [result.insertId]);
        
        return rows[0];
    }

    static async findByProject(projectId) {
        const query = `
            SELECT m.*, u.name as sender_name 
            FROM Messages m 
            JOIN Users u ON m.sender_id = u.id 
            WHERE m.project_id = ? 
            ORDER BY m.created_at ASC
        `;
        const [rows] = await db.execute(query, [projectId]);
        return rows;
    }
}

Message.createTable().catch(console.error);

module.exports = Message;
