const  Permission  = require("../models/permissionModel");

exports.createPermission = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const permission = await Permission.create({
      name,
      description,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Permission created successfully", permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create permission" });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    return res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

exports.updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    permission.set({ name, description, status, updatedBy: req.user.id });
    await permission.save();

    return res.status(200).json({ message: "Permission updated successfully", permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update permission" });
  }
};

exports.deletePermission = async (req, res) => {
  const { id } = req.params;

  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    await permission.destroy();
    return res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete permission" });
  }
};
