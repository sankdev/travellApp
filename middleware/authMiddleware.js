const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
};
const { UserRole, Role } = require("../models");

exports.requireRole = (roleName) => async (req, res, next) => {
  try {
    const userRoles = await UserRole.findAll({
      where: { userId: req.user.id },
      include: [{ model: Role, where: { name: roleName } }],
    });

    if (userRoles.length === 0) {
      return res.status(403).json({ error: `Access denied. ${roleName} role is required.` });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to verify role." });
  }
};
// middleware/authMiddleware.js
module.exports.authenticate = (req, res, next) => {
  // Example: Simple token validation logic
  if (req.headers.authorization) {
    // Validate the token or perform authentication checks
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
