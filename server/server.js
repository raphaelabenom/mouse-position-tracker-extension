import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE']
}));

// Criar o banco de dados
const dbPromise = open({
  filename: './database.sqlite',
  driver: sqlite3.Database
});

// Inicializar o banco de dados
async function initializeDatabase() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS coordinates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      url TEXT,
      timestamp TEXT
    )
  `);
}

initializeDatabase();

// API endpoint para salvar coordenadas
app.post('/api/coordinates', async (req, res) => {
  try {
    const db = await dbPromise;
    const { x, y, url, timestamp } = req.body;
    await db.run(
      'INSERT INTO coordinates (x, y, url, timestamp) VALUES (?, ?, ?, ?)',
      [x, y, url, timestamp]
    );
    res.status(201).json({ message: 'Coordinates saved successfully' });
  } catch (error) {
    console.error('Error saving coordinates:', error);
    res.status(500).json({ error: 'Failed to save coordinates' });
  }
});

// API endpoint para recuperar as coordenadas
app.get('/api/coordinates', async (req, res) => {
  try {
    const db = await dbPromise;
    const coordinates = await db.all('SELECT * FROM coordinates ORDER BY id DESC LIMIT 50');
    res.json(coordinates);
  } catch (error) {
    console.error('Error retrieving coordinates:', error);
    res.status(500).json({ error: 'Failed to retrieve coordinates' });
  }
});

// API endpoint para deletar as coordenadas
app.delete('/api/coordinates', async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM coordinates');
    res.json({ message: 'All coordinates deleted successfully' });
  } catch (error) {
    console.error('Error deleting coordinates:', error);
    res.status(500).json({ error: 'Failed to delete coordinates' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

