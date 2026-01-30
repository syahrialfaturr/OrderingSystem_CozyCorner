const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Get daily revenue
router.get('/daily', (req, res) => {
  const db = getDb();
  const { date } = req.query;
  const today = date || new Date().toISOString().split('T')[0];

  // Get revenue breakdown by payment method
  db.all(
    `SELECT 
      payment_method,
      SUM(total_amount) as total
    FROM orders
    WHERE DATE(created_at) = ? AND status != 'cancelled'
    GROUP BY payment_method`,
    [today],
    (err, breakdown) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Calculate totals
      let cashRevenue = 0;
      let qrisRevenue = 0;

      breakdown.forEach(item => {
        if (item.payment_method === 'cash') {
          cashRevenue = item.total || 0;
        } else if (item.payment_method === 'qris') {
          qrisRevenue = item.total || 0;
        }
      });

      const totalRevenue = cashRevenue + qrisRevenue;

      // Get or create daily revenue record
      db.get(
        `SELECT * FROM daily_revenue WHERE date = ?`,
        [today],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (!row) {
            // Create entry if doesn't exist
            db.run(
              'INSERT INTO daily_revenue (date, total_revenue, total_orders) VALUES (?, ?, 0)',
              [today, totalRevenue],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.json({
                  id: this.lastID,
                  date: today,
                  total_revenue: totalRevenue,
                  cash_revenue: cashRevenue,
                  qris_revenue: qrisRevenue,
                  total_orders: 0,
                  cash_received: 0,
                  verified: false
                });
              }
            );
          } else {
            // Get total orders count
            db.get(
              'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ? AND status != ?',
              [today, 'cancelled'],
              (err, orderCount) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                // Update total revenue and return with breakdown
                db.run(
                  'UPDATE daily_revenue SET total_revenue = ?, total_orders = ? WHERE date = ?',
                  [totalRevenue, orderCount.count || 0, today],
                  (err) => {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                    res.json({
                      ...row,
                      total_revenue: totalRevenue,
                      cash_revenue: cashRevenue,
                      qris_revenue: qrisRevenue,
                      total_orders: orderCount.count || 0
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
});

// Update cash received
router.put('/cash', (req, res) => {
  const db = getDb();
  const { cash_received, date } = req.body;
  const today = date || new Date().toISOString().split('T')[0];

  if (cash_received === undefined || cash_received < 0) {
    return res.status(400).json({ error: 'Valid cash_received amount is required' });
  }

  db.run(
    `UPDATE daily_revenue 
     SET cash_received = ? 
     WHERE date = ?`,
    [cash_received, today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Cash received updated' });
    }
  );
});

// Verify daily revenue
router.post('/verify', (req, res) => {
  const db = getDb();
  const { date } = req.body;
  const today = date || new Date().toISOString().split('T')[0];

  db.run(
    `UPDATE daily_revenue 
     SET verified = 1, verified_at = CURRENT_TIMESTAMP 
     WHERE date = ?`,
    [today],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Daily revenue verified' });
    }
  );
});

// Get revenue history
router.get('/history', (req, res) => {
  const db = getDb();
  const { limit = 30 } = req.query;

  db.all(
    `SELECT * FROM daily_revenue 
     ORDER BY date DESC 
     LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
