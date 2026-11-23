const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Инициализация базы данных SQLite
const db = new Database('database.sqlite');

// Создание таблиц при старте (если они не существуют)
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Автоматическое добавление базовых категорий, если таблица пуста
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
if (categoryCount === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
  insertCat.run('Еда', 'expense');
  insertCat.run('Зарплата', 'income');
  insertCat.run('Транспорт', 'expense');
}

// --- РОУТЫ КАТЕГОРИЙ ---

app.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/categories', (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Некорректное имя или тип категории' });
    }
    const stmt = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
    const info = stmt.run(name, type);
    res.status(201).json({ id: info.lastInsertRowid, name, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- РОУТЫ ТРАНЗАКЦИЙ С SQL-ФИЛЬТРАЦИЕЙ ---

app.get('/transactions', (req, res) => {
  try {
    let query = `
      SELECT t.*, c.name as category_name, c.type as category_type 
      FROM transactions t 
      JOIN categories c ON t.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    // Фильтрация на уровне SQL-запроса (согласно требованиям)[cite: 17]
    const { category_id, type, from, to } = req.query;

    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }
    if (from) {
      query += ' AND t.date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND t.date <= ?';
      params.push(to);
    }

    query += ' ORDER BY t.date DESC, t.id DESC';

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/transactions', (req, res) => {
  try {
    const { amount, category_id, date, comment } = req.body;
    
    // Серверная валидация[cite: 17]
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }
    if (!category_id || !date) {
      return res.status(400).json({ error: 'Категория и дата обязательны для заполнения' });
    }

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Указанная категория не существует' });
    }

    const stmt = db.prepare('INSERT INTO transactions (amount, category_id, date, comment) VALUES (?, ?, ?, ?)');
    const info = stmt.run(amount, category_id, date, comment || '');
    
    res.status(201).json({ id: info.lastInsertRowid, amount, category_id, date, comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category_id, date, comment } = req.body;

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Операция не найдена' });
    }

    if (amount !== undefined && (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }

    const newCatId = category_id !== undefined ? Number(category_id) : existing.category_id;
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(newCatId);
    if (!category) {
      return res.status(400).json({ error: 'Указанная категория не существует' });
    }

    const newAmount = amount !== undefined ? amount : existing.amount;
    const newDate = date !== undefined && date !== '' ? date : existing.date;
    const newComment = comment !== undefined ? comment : existing.comment;

    db.prepare('UPDATE transactions SET amount = ?, category_id = ?, date = ?, comment = ? WHERE id = ?')
      .run(newAmount, newCatId, newDate, newComment, id);

    res.json({
      id: Number(id),
      amount: newAmount,
      category_id: newCatId,
      date: newDate,
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Операция не найдена' });
    }

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ success: true, id: Number(id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});