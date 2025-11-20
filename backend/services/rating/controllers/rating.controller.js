const { pgPool } = require('../../../shared/database');

exports.rateRide = async (req,res,next)=>{ try { const { rideId, toUserId, rating, review } = req.body; await pgPool.query('INSERT INTO ratings (ride_id, from_user_id, to_user_id, rating, review) VALUES ($1,$2,$3,$4,$5)', [rideId, req.user.id, toUserId, rating, review]); res.json({ success:true }); } catch(e){ next(e);} };

exports.getUserRatings = async (req,res,next)=>{ try { const { userId } = req.params; const rows = await pgPool.query('SELECT rating, review, created_at FROM ratings WHERE to_user_id=$1 ORDER BY created_at DESC LIMIT 100', [userId]); res.json({ success:true, data: rows.rows }); } catch(e){ next(e);} };

exports.getRideRatings = async (req,res,next)=>{ try { const { rideId } = req.params; const rows = await pgPool.query('SELECT rating, review, from_user_id, created_at FROM ratings WHERE ride_id=$1', [rideId]); res.json({ success:true, data: rows.rows }); } catch(e){ next(e);} };
