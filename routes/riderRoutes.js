const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderController");

// تسجيل رايدر جديد
router.post("/register", riderController.registerRider);

// جلب جميع الرايدرز
router.get("/", riderController.getAllRiders);

// جلب رايدر محدد حسب ID
router.get("/:id", riderController.getRiderById);

// تعديل بيانات رايدر
router.put("/:id", riderController.updateRider);

// حذف رايدر
router.delete("/:id", riderController.deleteRider);

module.exports = router;
