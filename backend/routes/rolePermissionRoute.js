const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  assignPermission,
  getPermissionsByRole,
  revokePermission,revokeRolePermission
} = require("../controllers/rolePermissionCtrl");

const router = express.Router();

router.post("/", authenticate, assignPermission);
router.get("/:roleId", authenticate, getPermissionsByRole);
router.delete("/:id", authenticate, revokePermission);
router.delete("/:roleId/permissions/:permissionId", revokeRolePermission);

module.exports = router;
