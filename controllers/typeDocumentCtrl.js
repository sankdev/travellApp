const  TypeDocument  = require("../models/typeDocument");

exports.createTypeDocument = async (req, res) => {
  const { name, status } = req.body;

  try {
    const typeDocument = await TypeDocument.create({
      name,
      status,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "TypeDocument created successfully", typeDocument });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create TypeDocument" });
  }
};
