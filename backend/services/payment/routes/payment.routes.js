const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');

router.get('/methods', ctrl.getMethods);
router.post('/initiate', ctrl.initiatePayment);
router.post('/bkash/create', ctrl.bkashCreate);
router.post('/nagad/create', ctrl.nagadCreate);
router.get('/verify/:txnId', ctrl.verifyPayment);
router.get('/wallet', ctrl.getWalletBalance);
router.post('/payout/request', ctrl.requestPayout);
router.post('/promo/apply', ctrl.applyPromo);
router.get('/history', ctrl.transactionHistory);

module.exports = router;