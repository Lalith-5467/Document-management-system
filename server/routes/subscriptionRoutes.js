const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET current subscription status
router.get('/status', authMiddleware, (req, res) => {
  res.json({
    success: true,
    subscription: {
      planId: 'free_trial',
      planName: 'Free Trial',
      status: 'trial',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 7,
      billingCycle: 'monthly',
      storageUsedBytes: 12.8 * 1024 * 1024 * 1024,
      storageLimitBytes: 100 * 1024 * 1024 * 1024
    }
  });
});

// POST activate plan
router.post('/activate', authMiddleware, (req, res) => {
  const { planId, cycle, amount, invoiceNo } = req.body;
  res.json({
    success: true,
    message: `Plan ${planId} activated successfully!`,
    invoiceNo: invoiceNo || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
  });
});

module.exports = router;
