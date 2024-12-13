const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createPermission,
  getAllPermissions,
  updatePermission,
  deletePermission,
} = require("../controllers/permissionCtrl");

const router = express.Router();

router.post("/", authenticate, createPermission);
router.get("/", authenticate, getAllPermissions);
router.put("/:id", authenticate, updatePermission);
router.delete("/:id", authenticate, deletePermission);

module.exports = router;
