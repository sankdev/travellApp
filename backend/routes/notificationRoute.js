const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationCtrl');
//const authMiddleware = require('../middlewares/authMiddleware');
const { authenticate } = require("../middleware/authMiddleware.js");
// Protect all routes
//router.use(authMiddleware.protect);

// GET /api/v1/notifications - Get all notifications for user
router.get('/',authenticate, notificationController.getUserNotifications);

// PATCH /api/v1/notifications/:id/read - Mark notification as read
router.patch('/:id/read',authenticate, notificationController.markAsRead);

// PATCH /api/v1/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read',authenticate, notificationController.markAllAsRead);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id',authenticate, notificationController.deleteNotification);

module.exports = router;
