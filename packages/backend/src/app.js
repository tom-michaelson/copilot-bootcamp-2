const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialTasks = [
  {
    description: 'Complete project documentation',
    due_date: '2025-12-20',
    completed: 0,
    sort_order: 1,
  },
  { description: 'Review pull requests', due_date: '2025-12-18', completed: 0, sort_order: 2 },
  { description: 'Deploy to production', due_date: '2025-12-15', completed: 0, sort_order: 3 },
];

const insertStmt = db.prepare(
  'INSERT INTO tasks (description, due_date, completed, sort_order) VALUES (?, ?, ?, ?)'
);

initialTasks.forEach((task) => {
  insertStmt.run(task.description, task.due_date, task.completed, task.sort_order);
});

console.log('In-memory database initialized with sample data');

// API Routes

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC').all();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST create new task
app.post('/api/tasks', (req, res) => {
  try {
    const { description, due_date } = req.body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Task description is required' });
    }

    // Get max sort_order and add 1
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM tasks').get();
    const sort_order = (maxOrder.max || 0) + 1;

    const stmt = db.prepare(
      'INSERT INTO tasks (description, due_date, completed, sort_order) VALUES (?, ?, 0, ?)'
    );
    const result = stmt.run(description, due_date || null, sort_order);
    const id = result.lastInsertRowid;

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description, due_date } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = [];
    const params = [];

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ error: 'Task description must be a non-empty string' });
      }
      updates.push('description = ?');
      params.push(description);
    }

    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH toggle completion status
app.patch('/api/tasks/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newCompleted = existingTask.completed ? 0 : 1;
    const stmt = db.prepare('UPDATE tasks SET completed = ? WHERE id = ?');
    stmt.run(newCompleted, id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({ error: 'Failed to toggle task completion' });
  }
});

// PATCH reorder tasks
app.patch('/api/tasks/reorder', (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    const stmt = db.prepare('UPDATE tasks SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction((taskUpdates) => {
      for (const task of taskUpdates) {
        stmt.run(task.sort_order, task.id);
      }
    });

    updateMany(tasks);

    const allTasks = db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC').all();
    res.json(allTasks);
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// DELETE task (only if completed)
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!existingTask.completed) {
      return res.status(400).json({ error: 'Only completed tasks can be deleted' });
    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db, insertStmt };
