const multer = require('multer');

// استخدام التخزين في الذاكرة (مؤقت)
const storage = multer.memoryStorage();

// إعداد الاستقبال لعدة صور
const upload = multer({ storage });

module.exports = upload;
