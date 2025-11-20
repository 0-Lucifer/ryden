const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  body: String,
  type: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const pushTokenSchema = new mongoose.Schema({ userId:String, token:String, platform:String, createdAt:{type:Date, default:Date.now} });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const PushToken = mongoose.models.PushToken || mongoose.model('PushToken', pushTokenSchema);

exports.sendNotification = async (req,res,next)=>{ try { const { userId, title, body, type } = req.body; const doc = await Notification.create({ userId, title, body, type }); res.json({ success:true, data: doc }); } catch(e){ next(e);} };
exports.getHistory = async (req,res,next)=>{ try { const list = await Notification.find({ userId: req.user.id }).sort({ createdAt:-1 }).limit(100); res.json({ success:true, data:list }); } catch(e){ next(e);} };
exports.markRead = async (req,res,next)=>{ try { await Notification.updateOne({ _id:req.params.id, userId:req.user.id }, { $set:{ isRead:true }}); res.json({ success:true }); } catch(e){ next(e);} };
exports.registerToken = async (req,res,next)=>{ try { const { token, platform } = req.body; await PushToken.updateOne({ token }, { $set:{ userId:req.user.id, platform } }, { upsert:true }); res.json({ success:true }); } catch(e){ next(e);} };
