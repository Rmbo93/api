const Rider = require("../models/riderModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY || 'your_secret_key';

exports.uploadDocuments = async (req, res) => {
  try {
    const riderId = req.user.userId; // مفترض إنو عندك middleware يقرأ الـ JWT

    const updates = {};
    if (req.files.licenseImage) updates.licenseImage = req.files.licenseImage[0].originalname;
    if (req.files.insuranceImage) updates.insuranceImage = req.files.insuranceImage[0].originalname;
    if (req.files.mechanicImage) updates.mechanicImage = req.files.mechanicImage[0].originalname;
    if (req.files.contractImage) updates.contractImage = req.files.contractImage[0].originalname;

    const updated = await Rider.findByIdAndUpdate(riderId, updates, { new: true });

    res.status(200).json({ message: "تم رفع الوثائق بنجاح", rider: updated });
  } catch (error) {
    console.error("❌ Error uploading documents:", error);
    res.status(500).json({ message: "فشل في رفع الوثائق", error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await Rider.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '7d' });
    const hasDocuments =
    !!user.licenseImage &&
    !!user.insuranceImage &&
    !!user.mechanicImage &&
    !!user.contractImage;

    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      hasDocuments, // ✅ أضفناها هون
      user: {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
};


// تسجيل رايدر جديد

exports.registerRider = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const existingRider = await Rider.findOne({ phoneNumber });

    if (existingRider) {
      return res.status(400).json({ message: "رقم الهاتف مسجل مسبقاً." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const rider = new Rider({
      ...req.body,
      password: hashedPassword,
    });

    await rider.save();

    // توليد التوكن بعد التسجيل
    const token = jwt.sign({ userId: rider._id }, secretKey, { expiresIn: '7d' });

    res.status(201).json({
      message: "تم تسجيل الرايدر بنجاح.",
      token, // ✅ أضفنا التوكن هون
      rider: {
        id: rider._id,
        fullName: rider.fullName,
        phoneNumber: rider.phoneNumber,
        isVerified: rider.isVerified,
      }
    });
  } catch (error) {
    console.error('❌ Error in registerRider:', error);
    res.status(500).json({ message: "حدث خطأ أثناء التسجيل.", error });
  }
};


// جلب جميع الرايدرز
exports.getAllRiders = async (req, res) => {
  try {
    const riders = await Rider.find();
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب البيانات.", error });
  }
};

// جلب رايدر حسب ID
exports.getRiderById = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) return res.status(404).json({ message: "الرايدر غير موجود." });
    res.json(rider);
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب الرايدر.", error });
  }
};
exports.updatePreferences = async (req, res) => {
  try {
    const riderId = req.user.userId;
    const { ridePreferences } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { ridePreferences },
      { new: true }
    );

    res.status(200).json({ message: 'Preferences updated successfully', rider });
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
};

// تحديث بيانات رايدر
exports.updateRider = async (req, res) => {
  try {
    const updated = await Rider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "الرايدر غير موجود للتحديث." });
    res.json({ message: "تم التحديث بنجاح.", rider: updated });
  } catch (error) {
    res.status(500).json({ message: "خطأ أثناء التحديث.", error });
  }
};

// حذف رايدر
exports.deleteRider = async (req, res) => {
  try {
    const deleted = await Rider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "الرايدر غير موجود للحذف." });
    res.json({ message: "تم حذف الرايدر بنجاح." });
  } catch (error) {
    res.status(500).json({ message: "فشل في حذف الرايدر.", error });
  }
};
// إرسال إشعار للسائقين أونلاين المهتمين بـ VIP
exports.notifyVipDrivers = async (req, res) => {
  try {
    // جلب جميع السائقين الذين أونلاين ويفضلون VIP
    const vipDrivers = await Rider.find({
      isOnline: true,
      preferredRideTypes: { $in: ['VIP'] }
    });

    if (vipDrivers.length === 0) {
      return res.status(200).json({ message: "لا يوجد سائقين VIP متصلين حالياً." });
    }

    // Placeholder: عرض السائقين الذين يجب أن تصلهم الإشعارات
    vipDrivers.forEach(driver => {
      console.log(`🚨 إشعار لـ ${driver.fullName} (رقم: ${driver.phoneNumber}) - يوجد طلب VIP`);
      // TODO: هنا ممكن تربط Firebase Cloud Messaging لإرسال إشعار حقيقي
    });

    res.status(200).json({ message: `تم إشعار ${vipDrivers.length} سائق/ين بخدمة VIP.` });

  } catch (error) {
    console.error('❌ Error notifying VIP drivers:', error);
    res.status(500).json({ message: "فشل إرسال الإشعارات.", error });
  }
};
exports.saveExpoToken = async (req, res) => {
  try {
    const riderId = req.user.userId; // من middleware
    const { expoPushToken } = req.body;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      { expoPushToken },
      { new: true }
    );

    res.status(200).json({ message: 'Token saved', rider });
  } catch (error) {
    console.error('❌ Error saving token:', error);
    res.status(500).json({ message: 'Failed to save token' });
  }
};
exports.updateRiderToken = async (req, res) => {
  try {
    const token = req.body.expoPushToken;
    const riderId = req.userId;

    await Rider.findByIdAndUpdate(riderId, { expoPushToken: token });
    res.status(200).json({ message: 'Token updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update token', error });
  }
};
