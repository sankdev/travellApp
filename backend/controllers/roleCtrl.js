const Permission  = require("../models/PermissionModel");
const Role  = require("../models/roleModel");

exports.createRole = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const role = await Role.create({
      name,
      description,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create role" });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({include:{model:Permission, as:'permissions', }});
    return res.status(200).json(roles);
  } catch (error) { 
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch roles" });
  }
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    role.set({ name, description, status, updatedBy: req.user.id });
    await role.save();

    return res.status(200).json({ message: "Role updated successfully", role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update role" });
  }
};

exports.deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await role.destroy();
    return res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete role" });
  }
};
