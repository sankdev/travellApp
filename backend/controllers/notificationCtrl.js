//const { Notification, User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Notification=require('../models/notification')
const User=require('../models/userModel')
/**
 * @desc    Get all notifications for user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
exports.getUserNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
       
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.update({ isRead: true });

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.update(
    { isRead: true },
    {
      where: {
        userId: req.user.id,
        isRead: false
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  await notification.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * @desc    Create notification (internal use)
 * @access  Private
 */
exports.createNotification = async (userId, notificationData) => {
  return await Notification.create({
    userId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type || 'info',
    relatedEntity: notificationData.relatedEntity,
    relatedEntityId: notificationData.relatedEntityId
  });
};
