const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const bcrypt = require('bcryptjs');
// الحصول على جميع المستخدمين
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// الحصول على مستخدم محدد
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

        // تسجيل الدخول
exports.loginUser = async (req, res) => {
try {
    const { mobile, password } = req.body;

    // البحث عن المستخدم بناءً على رقم الهاتف
    const user = await User.findOne({ mobile });
    if (!user) {
    return res.status(400).json({ error: 'Invalid mobile number or password' });
    }

    // ✅ التحقق من صحة كلمة المرور باستخدام `bcrypt.compare()`
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(400).json({ error: 'Invalid mobile number or password' });
    }

    // إنشاء توكن JWT
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '7d' });

    console.log('📤 Login Response:', { message: 'Login successful', token });

    res.status(200).json({ message: 'Login successful', token });

} catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
};

  

// إنشاء مستخدم جديد
exports.createUser = async (req, res) => {
    try {
      const { firstName, lastName, mobile, email, password } = req.body;
  
      // التحقق مما إذا كان البريد الإلكتروني أو رقم الهاتف مسجلًا مسبقًا
      const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Email or mobile number already exists' });
      }
  
      // ✅ تشفير كلمة المرور قبل الحفظ
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // إنشاء المستخدم الجديد باستخدام كلمة المرور المشفرة
      const newUser = new User({ firstName, lastName, mobile, email, password: hashedPassword });
      await newUser.save();
  
      // ✅ إنشاء توكن JWT
      const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '7d' });
  
      console.log('📤 Sending Response:', { message: 'User created successfully', token });
  
      res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
      console.error('❌ Error creating user:', error);
      res.status(500).json({ error: error.message });
    }
  };
// تحديث بيانات المستخدم
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

// حذف مستخدم
exports.deleteUser = async (req, res) => {
  try {
    // استخراج التوكن من الهيدر
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // التحقق من صحة التوكن واستخراج `userId`
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    // البحث عن المستخدم وحذفه
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

const Rider = require('../models/riderModel');
const fetch = require('node-fetch');

exports.sendVipNotification = async (req, res) => {
  try {
    const { type } = req.body;

    // جلب السائقين المتاحين
    const onlineRiders = await Rider.find({
      isOnline: true,
      ridePreferences: { vip: true }, // تأكد ان هذا موجود في الداتا
      expoPushToken: { $exists: true },
    });

    for (const rider of onlineRiders) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: rider.expoPushToken,
          sound: 'default',
          title: '🚖 VIP Ride Request!',
          body: 'A client is requesting a VIP ride. Open the app to accept it.',
        }),
      });
    }

    res.status(200).json({ message: 'Notifications sent' });
  } catch (error) {
    console.error('❌ Notification Error:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
};
const { Expo } = require('expo-server-sdk');
let expo = new Expo();

exports.notifyVIPDrivers = async (req, res) => {
  try {
    const { message } = req.body;
    
    // ✅ الفلترة الآن تشمل فقط السائقين الأونلاين الذين يفضلون VIP
    const onlineRiders = await Rider.find({
      isOnline: true,
      expoPushToken: { $exists: true, $ne: null },
      ridePreferences: { $in: ['VIP'] }
    });

    console.log("🚕 Sending VIP notifications to:", onlineRiders.map(r => ({
      name: r.fullName,
      token: r.expoPushToken
    })));

    const messages = onlineRiders.map(driver => ({
      to: driver.expoPushToken,
      sound: 'default',
      title: '🚖 VIP Ride Request!',
      body: message || 'A client is requesting a VIP ride.',
      data: { type: 'vip-request' }
    }));

    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    res.status(200).json({ message: 'Notifications sent to online VIP drivers.' });
  } catch (error) {
    console.error('❌ Notification error:', error);
    res.status(500).json({ message: 'Failed to send notifications.' });
  }
};

const onlineRiders = await Rider.find({
  isOnline: true,
  expoPushToken: { $exists: true, $ne: null },
  ridePreferences: { $in: ['VIP'] }
});
