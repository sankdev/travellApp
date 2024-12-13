const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  assignRole,
  getRolesByUser,
  revokeRole,
} = require("../controllers/userRole");

const router = express.Router();

router.post("/", authenticate, assignRole);
router.get("/:userId", authenticate, getRolesByUser);
router.delete("/:id", authenticate, revokeRole);

module.exports = router;
