const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Get all stock for today
router.get('/', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  db.all(`
    SELECT 
      s.id,
      s.menu_item_id,
      s.quantity,
      s.date,
      m.name,
      m.category,
      m.price
    FROM stock s
    JOIN menu_items m ON s.menu_item_id = m.id
    WHERE s.date = ?
    ORDER BY m.category, m.name
  `, [today], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update stock for today (bulk update)
router.post('/update', (req, res) => {
  const db = getDb();
  const { stocks } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!stocks || !Array.isArray(stocks)) {
    return res.status(400).json({ error: 'Stocks array is required' });
  }

  if (stocks.length === 0) {
    return res.status(400).json({ error: 'Stocks array cannot be empty' });
  }

  // Validate all stocks first
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    if (!stock.menu_item_id || stock.quantity === undefined || stock.quantity < 0) {
      return res.status(400).json({ error: `Invalid stock data at index ${i}: menu_item_id and quantity (>= 0) are required` });
    }
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let completed = 0;
    let hasError = false;

    const processStock = (index) => {
      if (hasError || index >= stocks.length) {
        if (completed === stocks.length && !hasError) {
          db.run('COMMIT', (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Stock updated successfully' });
          });
        }
        return;
      }

      const stock = stocks[index];

      // Check if stock exists for today
      db.get(
        'SELECT id FROM stock WHERE menu_item_id = ? AND date = ?',
        [stock.menu_item_id, today],
        (err, existing) => {
          if (err) {
            if (!hasError) {
              hasError = true;
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            return;
          }

          if (existing) {
            // Update existing stock
            db.run(
              'UPDATE stock SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [stock.quantity, existing.id],
              (err) => {
                completed++;
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                processStock(index + 1);
              }
            );
          } else {
            // Insert new stock
            db.run(
              'INSERT INTO stock (menu_item_id, quantity, date, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
              [stock.menu_item_id, stock.quantity, today],
              (err) => {
                completed++;
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                processStock(index + 1);
              }
            );
          }
        }
      );
    };

    // Start processing from index 0
    processStock(0);
  });
});

// Update single stock item
router.put('/:id', (req, res) => {
  const db = getDb();
  const { quantity } = req.body;
  const id = req.params.id;
  const today = new Date().toISOString().split('T')[0];

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  db.run(
    `UPDATE stock 
     SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND date = ?`,
    [quantity, id, today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Stock item not found for today' });
      }
      res.json({ success: true, message: 'Stock updated successfully' });
    }
  );
});

module.exports = router;
