const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const express = require("express");
const db = require("./database");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/uploads/");
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});
// API: Get all shows
app.get("/api/shows", (req, res) => {
  db.all("SELECT * FROM shows", [], (err, shows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(shows);
  });
});

// API: Get a specific show with episodes
app.get("/api/shows/:id", (req, res) => {
  const showId = req.params.id;

  db.get("SELECT * FROM shows WHERE id = ?", [showId], (err, show) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!show) {
      res.status(404).json({ error: "Show not found" });
      return;
    }

    db.all("SELECT * FROM episodes WHERE show_id = ?", [showId], (err, episodes) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      show.episodes = episodes;
      res.json(show);
    });
  });
});

// API: Add a new show
app.post("/api/shows", (req, res) => {
  const { title, description, thumbnail } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  db.run(
    "INSERT INTO shows (title, description, thumbnail) VALUES (?, ?, ?)",
    [title, description, thumbnail],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        id: this.lastID,
        title: title,
        description: description,
        thumbnail: thumbnail
      });
    }
  );
});

// API: Add a new episode to a show
app.post("/api/shows/:id/episodes", (req, res) => {
  const showId = req.params.id;
  const { title, file } = req.body;

  if (!title || !file) {
    res.status(400).json({ error: "Title and file are required" });
    return;
  }

  db.run(
    "INSERT INTO episodes (show_id, title, file) VALUES (?, ?, ?)",
    [showId, title, file],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        id: this.lastID,
        show_id: showId,
        title: title,
        file: file
      });
    }
  );
});
// API: Update a show
app.put("/api/shows/:id", (req, res) => {
  const showId = req.params.id;
  const { title, description, thumbnail } = req.body;

  db.run(
    "UPDATE shows SET title = ?, description = ?, thumbnail = ? WHERE id = ?",
    [title, description, thumbnail, showId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: "Show not found" });
        return;
      }

      res.json({ message: "Show updated successfully" });
    }
  );
});

// API: Delete a show
app.delete("/api/shows/:id", (req, res) => {
  const showId = req.params.id;

  // First delete episodes of this show
  db.run("DELETE FROM episodes WHERE show_id = ?", [showId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Then delete the show
    db.run("DELETE FROM shows WHERE id = ?", [showId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ message: "Show deleted successfully" });
    });
  });
});
// // API: Upload a video file
app.post("/api/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No video file uploaded" });
    return;
  }

  res.json({
    filename: req.file.filename,
    path: "/uploads/" + req.file.filename
  });
});
// API: Register a new user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function(err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          res.status(400).json({ error: "Username already exists" });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }

      res.json({ id: this.lastID, username: username });
    }
  );
});

// API: Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(401).json({ error: "Wrong password" });
    }
  });
});

// API: Add a comment
app.post("/api/shows/:id/comments", (req, res) => {
  const showId = req.params.id;
  const { userId, comment } = req.body;

  if (!userId || !comment) {
    res.status(400).json({ error: "User ID and comment required" });
    return;
  }

  db.run(
    "INSERT INTO comments (show_id, user_id, comment) VALUES (?, ?, ?)",
    [showId, userId, comment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ id: this.lastID, show_id: showId, user_id: userId, comment: comment });
    }
  );
});

// API: Get comments for a show
app.get("/api/shows/:id/comments", (req, res) => {
  const showId = req.params.id;

  db.all(
    "SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE show_id = ? ORDER BY comments.created_at DESC",
    [showId],
    (err, comments) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(comments);
    }
  );
});
// API: Save watch history
app.post("/api/history", (req, res) => {
  const { userId, episodeId, showId } = req.body;

  if (!userId || !episodeId || !showId) {
    res.status(400).json({ error: "User ID, episode ID, and show ID required" });
    return;
  }

  db.run(
    "INSERT INTO watch_history (user_id, episode_id, show_id) VALUES (?, ?, ?)",
    [userId, episodeId, showId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ id: this.lastID });
    }
  );
});

// API: Get watch history for a user
app.get("/api/history/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `SELECT watch_history.*, episodes.title as episode_title, shows.title as show_title, shows.thumbnail
     FROM watch_history 
     JOIN episodes ON watch_history.episode_id = episodes.id
     JOIN shows ON watch_history.show_id = shows.id
     WHERE watch_history.user_id = ?
     ORDER BY watch_history.watched_at DESC`,
    [userId],
    (err, history) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(history);
    }
  );
});
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});