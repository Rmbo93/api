const Rider = require("../models/riderModel");

// تسجيل رايدر جديد
exports.registerRider = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const existingRider = await Rider.findOne({ phoneNumber });

    if (existingRider) {
      return res.status(400).json({ message: "رقم الهاتف مسجل مسبقاً." });
    }

    const rider = new Rider(req.body);
    await rider.save();

    res.status(201).json({ message: "تم تسجيل الرايدر بنجاح.", rider });
  } catch (error) {
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
