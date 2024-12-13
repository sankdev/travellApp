const  Campaign  = require("../models/compaign");

exports.createCampaign = async (req, res) => {
  const { title, type, description, condition, startAt, endAt, price, status, company, vol, destination } = req.body;

  try {
    const campaign = await Campaign.create({
      title,
      type,
      description,
      condition,
      startAt,
      endAt,
      price,
      status,
      company,
      vol,
      destination,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Campaign created successfully", campaign });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create campaign" });
  }
};
