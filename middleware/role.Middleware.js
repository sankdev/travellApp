const db = require('../config/bd');

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Charger l'utilisateur avec ses rôles et permissions
      const user = await db.User.findByPk(req.user.id, {
        include: [{
          model: db.Role,
          include: [{ model: db.Permission }]
        }]
      });

      if (!user || !user.Roles || user.Roles.length === 0) {
        return res.status(403).json({ message: 'Forbidden: No roles assigned' });
      }

      // Vérifier si l'utilisateur a au moins un des rôles requis
      const userRoles = user.Roles.map(role => role.name);
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
      }

      // Ajouter les rôles et permissions au `req` pour une utilisation ultérieure
      req.userRoles = userRoles;
      req.userPermissions = user.Roles.flatMap(role => role.Permissions.map(permission => permission.name));

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware pour vérifier les permissions
const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Charger l'utilisateur avec ses rôles et permissions
      const user = await db.User.findByPk(req.user.id, {
        include: [{
          model: db.Role,
          include: [{ model: db.Permission }]
        }]
      });

      if (!user || !user.Roles || user.Roles.length === 0) {
        return res.status(403).json({ message: 'Forbidden: No permissions assigned' });
      }

      // Obtenir les permissions de l'utilisateur
      const userPermissions = user.Roles.flatMap(role => role.Permissions.map(permission => permission.name));

      // Vérifier si l'utilisateur a toutes les permissions requises
      const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission));

      if (!hasPermission) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middlewares pour les rôles
const isAdmin = checkRole(['admin']);
const isAgency = checkRole(['agency']);
const isCustomer = checkRole(['customer']);
const isAgencyOrAdmin = checkRole(['agency', 'admin']);

// Middlewares pour les permissions
const canManageUsers = checkPermission(['manage_users']);
const canManageRoles = checkPermission(['manage_roles']);
const canManagePermissions = checkPermission(['manage_permissions']);
const canManageFlights = checkPermission(['manage_flights']);
const canManageReservations = checkPermission(['manage_reservations']);
const canManageDestinations = checkPermission(['manage_destinations']);
const canManageCompanies = checkPermission(['manage_companies']);
const canManageClasses = checkPermission(['manage_classes']);
const canManageDocuments = checkPermission(['manage_documents']);
const canManageVisas = checkPermission(['manage_visas']);

module.exports = {
  checkRole,
  checkPermission,
  isAdmin,
  isAgency,
  isCustomer,
  isAgencyOrAdmin,
  canManageUsers,
  canManageRoles,
  canManagePermissions,
  canManageFlights,
  canManageReservations,
  canManageDestinations,
  canManageCompanies,
  canManageClasses,
  canManageDocuments,
  canManageVisas
};
