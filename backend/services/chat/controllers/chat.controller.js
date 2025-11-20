const mongoose = require('mongoose');

const Message = mongoose.models.Message;

exports.getRideMessages = async (req,res,next)=>{ try { const { rideId } = req.params; const list = await Message.find({ rideId }).sort({ createdAt:1 }).limit(200); res.json({ success:true, data:list }); } catch(e){ next(e);} };
exports.markRead = async (req,res,next)=>{ try { res.json({ success:true }); } catch(e){ next(e);} };
