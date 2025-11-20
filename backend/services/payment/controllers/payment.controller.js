const { pgPool } = require('../../../shared/database');

exports.getMethods = async (req,res,next)=>{ try { res.json({ success:true, data:['bkash','nagad','rocket','sslcommerz','cash']}); } catch(e){ next(e);} };

exports.initiatePayment = async (req,res,next)=>{ try { const { rideId, method, amount } = req.body; const txnId = 'TXN-' + Date.now(); res.json({ success:true, data:{ txnId, rideId, method, amount, status:'pending' }}); } catch(e){ next(e);} };

exports.bkashCreate = async (req,res,next)=>{ try { res.json({ success:true, data:{ redirectUrl:'https://bkash.placeholder/pay' }}); } catch(e){ next(e);} };
exports.nagadCreate = async (req,res,next)=>{ try { res.json({ success:true, data:{ redirectUrl:'https://nagad.placeholder/pay' }}); } catch(e){ next(e);} };

exports.verifyPayment = async (req,res,next)=>{ try { const { txnId } = req.params; res.json({ success:true, data:{ txnId, status:'success' }}); } catch(e){ next(e);} };

exports.getWalletBalance = async (req,res,next)=>{ try { res.json({ success:true, data:{ balance: 0 }}); } catch(e){ next(e);} };

exports.requestPayout = async (req,res,next)=>{ try { const { amount, method } = req.body; const payoutId = 'PAYOUT-' + Date.now(); res.json({ success:true, data:{ payoutId, amount, method, status:'pending' }}); } catch(e){ next(e);} };

exports.applyPromo = async (req,res,next)=>{ try { const { code, rideId } = req.body; res.json({ success:true, data:{ code, discount:20, rideId }}); } catch(e){ next(e);} };

exports.transactionHistory = async (req,res,next)=>{ try { res.json({ success:true, data:{ transactions:[] }}); } catch(e){ next(e);} };
