const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const upload = require('../middlewares/uploadMiddleware');
const authenticate = require('../middlewares/authMiddleware');

// ✅ لازم يكون هذا فوق كل الراوتات يلي فيها /:id
router.put(
  '/upload-documents',
  authenticate,
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
module.exports = router;
