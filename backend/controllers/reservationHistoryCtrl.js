//const { ReservationHistory, Reservation, User } = require('../models');
const ReservationHistory=require("../models/reservationHistory")
const Reservation = require('../models/booking');
const User = require('../models/userModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Récupère l'historique complet d'une réservation
 */
exports.getReservationHistory = catchAsync(async (req, res, next) => {
  const { reservationId } = req.params;

  // Vérifier que l'utilisateur a accès à cette réservation
  const reservation = await Reservation.findOne({
    where: { id: reservationId },
    include: [{
      model: User,
      as: 'customer',
      where: { id: req.user.id }
    }]
  });

  if (!reservation && !req.user.roles.includes('admin')) {
    return next(new AppError('Vous n\'avez pas accès à cet historique', 403));
  }

  const history = await ReservationHistory.findAll({
    where: { reservationId },
    include: [{
      model: User,
      as: 'actor',
      attributes: ['id', 'firstName', 'lastName', 'email']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    data: history
  });
});

/**
 * Récupère une entrée spécifique de l'historique
 */
exports.getHistoryEntry = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const historyEntry = await ReservationHistory.findByPk(id, {
    include: [
      {
        model: Reservation,
        as: 'reservation',
        attributes: ['id', 'status']
      },
      {
        model: User,
        as: 'actor',
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });

  if (!historyEntry) {
    return next(new AppError('Entrée d\'historique non trouvée', 404));
  }

  // Vérifier les permissions
  if (req.user.id !== historyEntry.changedBy && 
      req.user.id !== historyEntry.reservation.userId && 
      !req.user.roles.includes('admin')) {
    return next(new AppError('Non autorisé', 403));
  }

  res.status(200).json({
    status: 'success',
    data: historyEntry
  });
});

/**
 * Récupère l'historique des actions d'un utilisateur
 */
exports.getUserHistory = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  const userHistory = await ReservationHistory.findAll({
    where: { changedBy: id },
    include: [{
      model: Reservation,
      as: 'reservation',
      attributes: ['id', 'status', 'startAt', 'endAt']
    }],
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  res.status(200).json({
    status: 'success',
    results: userHistory.length,
    data: userHistory
  });
});

/**
 * Supprime une entrée d'historique (admin seulement)
 */
exports.deleteHistoryEntry = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const historyEntry = await ReservationHistory.findByPk(id);
  if (!historyEntry) {
    return next(new AppError('Entrée d\'historique non trouvée', 404));
  }

  await historyEntry.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Fonction utilitaire pour créer une entrée d'historique (à utiliser dans d'autres contrôleurs)
exports.createHistoryEntry = async (reservationId, action, userId, changes = {}) => {
  return await ReservationHistory.create({
    reservationId,
    action,
    changedBy: userId,
    previousData: changes.previousData || null,
    newData: changes.newData || null,
    notes: changes.notes || null
  });
};
