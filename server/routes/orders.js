const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Create new order
router.post('/', (req, res) => {
  const db = getDb();
  const { items, orderType = 'cashier', paymentMethod = 'cash' } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  // Calculate total
  let totalAmount = 0;
  items.forEach(item => {
    totalAmount += item.price * item.quantity;
  });

  // Generate order number
  const orderNumber = `ORD-${Date.now()}`;

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check stock availability
    const checkStock = (item, callback) => {
      db.get(
        'SELECT quantity FROM stock WHERE menu_item_id = ? AND date = ?',
        [item.menu_item_id, today],
        (err, stock) => {
          if (err) return callback(err);
          if (!stock || stock.quantity < item.quantity) {
            return callback(new Error(`Insufficient stock for item ${item.menu_item_id}`));
          }
          callback(null);
        }
      );
    };

    // Check all items
    let checked = 0;
    let hasError = false;
    items.forEach(item => {
      checkStock(item, (err) => {
        checked++;
        if (err && !hasError) {
          hasError = true;
          db.run('ROLLBACK');
          return res.status(400).json({ error: err.message });
        }
        if (checked === items.length && !hasError) {
          // Create order
          db.run(
            'INSERT INTO orders (order_number, order_type, total_amount, payment_method) VALUES (?, ?, ?, ?)',
            [orderNumber, orderType, totalAmount, paymentMethod],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }

              const orderId = this.lastID;

              // Insert order items
              const stmt = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)');
              items.forEach(item => {
                stmt.run(orderId, item.menu_item_id, item.quantity, item.price);
              });
              stmt.finalize();

              // Update stock
              items.forEach(item => {
                db.run(
                  'UPDATE stock SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE menu_item_id = ? AND date = ?',
                  [item.quantity, item.menu_item_id, today]
                );
              });

              // Update daily revenue
              db.run(
                `INSERT INTO daily_revenue (date, total_revenue, total_orders)
                 VALUES (?, ?, 1)
                 ON CONFLICT(date) DO UPDATE SET
                   total_revenue = total_revenue + ?,
                   total_orders = total_orders + 1`,
                [today, totalAmount, totalAmount],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                  }

                  db.run('COMMIT');
                  res.json({
                    success: true,
                    order: {
                      id: orderId,
                      order_number: orderNumber,
                      total_amount: totalAmount
                    }
                  });
                }
              );
            }
          );
        }
      });
    });
  });
});

// Get all orders
router.get('/', (req, res) => {
  const db = getDb();
  const { date, status } = req.query;
  const today = date || new Date().toISOString().split('T')[0];

  let query = `
    SELECT o.*, 
           GROUP_CONCAT(oi.menu_item_id || ':' || oi.quantity || ':' || mi.name) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE DATE(o.created_at) = ?
  `;
  const params = [today];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' GROUP BY o.id ORDER BY o.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get order details
router.get('/:id', (req, res) => {
  const db = getDb();
  const id = req.params.id;

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.all(
      `SELECT oi.*, mi.name, mi.category
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = ?`,
      [id],
      (err, items) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ ...order, items });
      }
    );
  });
});

// Update order status
router.patch('/:id/status', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const id = req.params.id;

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  db.run(
    'UPDATE orders SET status = ?, completed_at = ? WHERE id = ?',
    [status, completedAt, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Order status updated' });
    }
  );
});

module.exports = router;
