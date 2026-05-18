const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
} = require("../controllers/roleCtrl");

const router = express.Router();

router.post("/", authenticate, createRole);
router.get("/",  getAllRoles);
router.put("/:id", authenticate, updateRole);
router.delete("/:id", authenticate, deleteRole);

module.exports = router;
