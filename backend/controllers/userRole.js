const UserRole  = require("../models/userRoleModel");

const assignRole = async (req, res) => {
  const { userId, roleId, status } = req.body;

  try {
    const userRole = await UserRole.create({
      userId,
      roleId,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Role assigned successfully", userRole });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to assign role" });
  }
};

const getRolesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const roles = await UserRole.findAll({ where: { userId } });
    return res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch roles for user" });
  }
};

const revokeRole = async (req, res) => {
  const { id } = req.params;

  try {
    const userRole = await UserRole.findByPk(id);

    if (!userRole) {
      return res.status(404).json({ error: "User role not found" });
    }

    await userRole.destroy();
    return res.status(200).json({ message: "Role revoked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to revoke role" });
  }
};
module.exports={assignRole,revokeRole,getRolesByUser}