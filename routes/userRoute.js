const express = require("express");
const router = express.Router();
const {getAllUsers,getUserById,createUser,loginUser,updateUser,requestPasswordReset,resetPassword,deleteUser,changePassword} = require("../controllers/userCtrl");
const {verifyToken}=require('../middleware/authMiddleware')
// Routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/registration", createUser);
router.post("/login", loginUser);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// Password change route
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
