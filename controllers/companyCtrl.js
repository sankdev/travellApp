const  Company  = require("../models/Company");

exports.createCompany = async (req, res) => {
  const { name, status, image1, image2, image3 } = req.body;

  try {
    const company = await Company.create({
      name,
      status,
      image1,
      image2,
      image3,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create company" });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    return res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch companies" });
  }
};
