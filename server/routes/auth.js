const express = require('express');
const router = express.Router();

// Default admin password - bisa diubah melalui environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Login endpoint
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password diperlukan' });
  }

  if (password === ADMIN_PASSWORD) {
    // Generate simple token (in production, use JWT or similar)
    const token = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    return res.json({
      success: true,
      token: token,
      message: 'Login berhasil'
    });
  } else {
    return res.status(401).json({ error: 'Password salah' });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token diperlukan' });
  }

  // Simple token validation (in production, use proper JWT validation)
  if (token.startsWith('admin_')) {
    return res.json({ success: true, message: 'Token valid' });
  } else {
    return res.status(401).json({ success: false, error: 'Token tidak valid' });
  }
});

module.exports = router;
