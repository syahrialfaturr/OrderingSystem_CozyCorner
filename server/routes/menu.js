const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Get all menu items with current stock
router.get('/', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.all(`
    SELECT 
      m.*,
      COALESCE(s.quantity, 0) as stock,
      CASE WHEN COALESCE(s.quantity, 0) > 0 THEN 0 ELSE 1 END as is_sold_out
    FROM menu_items m
    LEFT JOIN stock s ON m.id = s.menu_item_id AND s.date = ?
    ORDER BY m.category, m.name
  `, [today], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get menu items by category
router.get('/category/:category', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const category = req.params.category;

  db.all(`
    SELECT 
      m.*,
      COALESCE(s.quantity, 0) as stock,
      CASE WHEN COALESCE(s.quantity, 0) > 0 THEN 0 ELSE 1 END as is_sold_out
    FROM menu_items m
    LEFT JOIN stock s ON m.id = s.menu_item_id AND s.date = ?
    WHERE m.category = ?
    ORDER BY m.name
  `, [today, category], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single menu item
router.get('/:id', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const id = req.params.id;

  db.get(`
    SELECT 
      m.*,
      COALESCE(s.quantity, 0) as stock,
      CASE WHEN COALESCE(s.quantity, 0) > 0 THEN 0 ELSE 1 END as is_sold_out
    FROM menu_items m
    LEFT JOIN stock s ON m.id = s.menu_item_id AND s.date = ?
    WHERE m.id = ?
  `, [today, id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(row);
  });
});

// Update menu item (description, price, etc)
router.put('/:id', (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const { description, price, name } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);

  const query = `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item updated successfully' });
  });
});

module.exports = router;
