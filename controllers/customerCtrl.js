const  Customer = require("../models/customer.js");


// Get a specific customer by ID
const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findOne({ where: { id, userId: req.user.id } });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch customer" });
  }
};


// Créer un nouveau client
const createCustomer = async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    birthDate,
    birthPlace,
    nationality,
    profession,
    typeDocument,
    numDocument,
    document,
  } = req.body;

  try {
    // Créer un client lié à l'utilisateur connecté
    const customer = await Customer.create({
      userId: req.user.id,
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      nationality,
      profession,
      typeDocument,
      numDocument,
      document,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
};

// Obtenir tous les clients associés à l'utilisateur
const  getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { userId: req.user.id },
    });

    return res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// Mettre à jour un client spécifique
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    gender,
    birthDate,
    birthPlace,
    nationality,
    profession,
    typeDocument,
    numDocument,
    document,
  } = req.body;

  try {
    const customer = await Customer.findOne({ where: { id, userId: req.user.id } });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Mettre à jour les informations du client
    customer.set({
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      nationality,
      profession,
      typeDocument,
      numDocument,
      document,
      updatedBy: req.user.id,
    });

    await customer.save();

    return res.status(200).json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update customer" });
  }
};

// Supprimer un client
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findOne({ where: { id, userId: req.user.id } });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await customer.destroy();

    return res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete customer" });
  }
};
module.exports={createCustomer,getAllCustomers,updateCustomer,deleteCustomer,getCustomerById}