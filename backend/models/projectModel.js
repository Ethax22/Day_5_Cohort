const db = require('../config/db');

class Project {
    static async createTables() {
        const projectTable = `
      CREATE TABLE IF NOT EXISTS Projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES Users(id)
      )
    `;
        const collaboratorTable = `
      CREATE TABLE IF NOT EXISTS Project_Collaborators (
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES Projects(id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
      )
    `;
        await db.execute(projectTable);
        await db.execute(collaboratorTable);
    }

    static async create(name, description, ownerId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [projectResult] = await connection.execute(
                'INSERT INTO Projects (name, description, owner_id) VALUES (?, ?, ?)',
                [name, description, ownerId]
            );
            const projectId = projectResult.insertId;

            await connection.execute(
                'INSERT INTO Project_Collaborators (project_id, user_id) VALUES (?, ?)',
                [projectId, ownerId]
            );

            await connection.commit();
            return projectId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByUser(userId) {
        const query = `
      SELECT p.* FROM Projects p
      JOIN Project_Collaborators pc ON p.id = pc.project_id
      WHERE pc.user_id = ?
    `;
        const [rows] = await db.execute(query, [userId]);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM Projects WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
}

Project.createTables().catch(console.error);

module.exports = Project;