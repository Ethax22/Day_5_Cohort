const db = require('../config/db');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        plan ENUM('free', 'premium') DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.execute(query);
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(name, email, passwordHash) {
    const query = 'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [name, email, passwordHash]);
    return result.insertId;
  }
}

User.createTable().catch(console.error);

module.exports = User;
