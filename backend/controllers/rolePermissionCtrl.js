const RolePermission = require("../models/RolepermissionModel");

exports.assignPermission = async (req, res) => {
  const { roleId, permissionId, status } = req.body;

  try {
    const rolePermission = await RolePermission.create({
      roleId,
      permissionId,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Permission assigned successfully", rolePermission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to assign permission" });
  }
};

exports.getPermissionsByRole = async (req, res) => {
  const { roleId } = req.params;

  try {
    const permissions = await RolePermission.findAll({ where: { roleId } });
    return res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch permissions for role" });
  }
};

exports.revokePermission = async (req, res) => {
  const { id } = req.params;

  try {
    const rolePermission = await RolePermission.findByPk(id);

    if (!rolePermission) {
      return res.status(404).json({ error: "Role permission not found" });
    }

    await rolePermission.destroy();
    return res.status(200).json({ message: "Permission revoked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to revoke permission" });
  }
};
exports.revokeRolePermission = async (req, res) => {
  const { roleId, permissionId } = req.params;

  try {
    // Vérifier si la relation existe
    const rolePermission = await RolePermission.findOne({ 
      where: { roleId, permissionId } 
    });

    if (!rolePermission) {
      return res.status(404).json({ error: "La permission pour ce rôle n'existe pas" });
    }

    // Supprimer la relation
    await rolePermission.destroy();

    return res.status(200).json({ message: "Permission révoquée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la révocation :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
