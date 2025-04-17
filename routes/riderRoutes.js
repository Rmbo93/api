const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const riderController = require('../controllers/riderController');
const upload = require('../middlewares/uploadMiddleware');

// ✅ لازم يكون هذا فوق كل الراوتات يلي فيها /:id
router.put(
  '/upload-documents',
  authMiddleware, // ✅ تم التعديل هنا
  upload.fields([
    { name: 'licenseImage' },
    { name: 'insuranceImage' },
    { name: 'mechanicImage' },
    { name: 'contractImage' },
  ]),
  riderController.uploadDocuments
);

// باقي الراوتات
router.post('/login', riderController.loginUser);
router.post('/register', riderController.registerRider);
router.get('/', riderController.getAllRiders);
router.get('/:id', riderController.getRiderById);
router.put('/:id', riderController.updateRider);
router.delete('/:id', riderController.deleteRider);
router.post('/notify-vip', riderController.notifyVipDrivers);
router.put('/save-token', authMiddleware, riderController.saveExpoToken);
router.post('/update-token', authMiddleware, riderController.updateRiderToken);
router.put('/update-preferences', authMiddleware, riderController.updatePreferences);

module.exports = router;
