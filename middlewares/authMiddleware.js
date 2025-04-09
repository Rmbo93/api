const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'your_secret_key';

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // من "Bearer xxx"

    if (!token) {
      return res.status(401).json({ message: 'التوكن غير موجود' });
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'توكن غير صالح' });
      }
      req.user = user; // هون بنخزن بيانات الرايدر (userId مثلاً)
      console.log('✅ Authenticated User:', user);

      next(); // نكمل للراوت
    });
  } catch (error) {
    console.error('❌ authMiddleware error:', error);
    res.status(500).json({ message: 'خطأ في التحقق من الهوية' });
  }
};

module.exports = authenticate;
  