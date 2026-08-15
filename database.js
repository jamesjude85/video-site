const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(process.env.DB_PATH || "./videos.db");

// Create tables
db.serialize(() => {
  // Shows table
  db.run(`
    CREATE TABLE IF NOT EXISTS shows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail TEXT
    )
  `);

  // Episodes table
  db.run(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER,
      title TEXT NOT NULL,
      file TEXT NOT NULL,
      FOREIGN KEY (show_id) REFERENCES shows(id)
    )
  `);

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER,
      user_id INTEGER,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (show_id) REFERENCES shows(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  // Watch history table
  db.run(`
    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      episode_id INTEGER,
      show_id INTEGER,
      watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (episode_id) REFERENCES episodes(id),
      FOREIGN KEY (show_id) REFERENCES shows(id)
    )
  `);
  // Check if shows table is empty
  db.get("SELECT COUNT(*) as count FROM shows", (err, row) => {
    if (row.count === 0) {
      // Insert sample data
      db.run(`INSERT INTO shows (title, description, thumbnail) VALUES 
        ('Anime Show One', 'An exciting adventure series about friendship and courage.', 'https://picsum.photos/640/360?random=10'),
        ('Anime Show Two', 'A thrilling mystery series full of twists and turns.', 'https://picsum.photos/640/360?random=20'),
        ('Anime Show Three', 'A fantasy series in a magical world.', 'https://picsum.photos/640/360?random=30')
      `);

      db.run(`INSERT INTO episodes (show_id, title, file) VALUES 
        (1, 'Episode 1 - The Beginning', 'myvideo.mp4'),
        (1, 'Episode 2 - The Journey', 'video2.mp4'),
        (1, 'Episode 3 - The Battle', 'video3.mp4'),
        (2, 'Episode 1 - The Secret', 'video2.mp4'),
        (2, 'Episode 2 - The Clue', 'video3.mp4'),
        (2, 'Episode 3 - The Truth', 'myvideo.mp4'),
        (3, 'Episode 1 - The Awakening', 'video3.mp4'),
        (3, 'Episode 2 - The Quest', 'myvideo.mp4'),
        (3, 'Episode 3 - The Return', 'video2.mp4')
      `);
    }
  });
});

module.exports = db;