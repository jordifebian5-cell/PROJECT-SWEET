const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Agar bisa menerima file foto base64
app.use(express.static(path.join(__dirname, 'public')));

// 1. KONEKSI DATABASE SQLITE
const db = new sqlite3.Database('./kenangan.db', (err) => {
    if (err) {
        console.error("Gagal membuka database SQL:", err.message);
    } else {
        console.log("Berhasil terhubung ke Database SQL! ❤️");
        // Buat tabel jika belum ada
        db.run(`CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            desc TEXT,
            isVideo INTEGER DEFAULT 0
        )`);
    }
});

// 2. JALUR API (Untuk Simpan, Ambil, Hapus Foto)
app.get('/api/media', (req, res) => {
    db.all("SELECT * FROM media ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => ({ ...r, isVideo: r.isVideo === 1 })));
    });
});

app.post('/api/media', (req, res) => {
    const { url, title, desc, isVideo } = req.body;
    db.run("INSERT INTO media (url, title, desc, isVideo) VALUES (?, ?, ?, ?)", [url, title, desc, isVideo ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

app.delete('/api/media/:id', (req, res) => {
    db.run("DELETE FROM media WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server web berjalan di http://localhost:${PORT}`);
});
