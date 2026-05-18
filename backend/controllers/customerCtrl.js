const Customer = require("../models/customer.js");
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Invoice=require('../models/invoice')
const Reservation=require('../models/booking')
const Destination =require('../models/destinationModel')
const Payment=require('../models/payment');
const  Passenger  = require('../models/Passenger');
const Agency=require('../models/agenceModel')
// Get a specific customer by ID
// const getCustomerById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const customer = await Customer.findOne({ where: { id: parseInt(id), userId: req.user.id } });

//     if (!customer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }

//     return res.status(200).json(customer); 
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Failed to fetch customer" });
//   }
// };
const getCustomerById = async (req, res) => {
  const { id } = req.params;

  // Validate and parse the ID
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  try {
    const customer = await Customer.findOne({
      where: { id: parsedId, userId: req.user.id },
    });

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
    phone,
    email,
    gender,
    birthDate,
    birthPlace,
    nationality,
    profession,
    typeDocument,
    numDocument,
  } = req.body;

  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const existingCustomer = await Customer.findOne({
      where: { userId: req.user.id }
    });

    if (existingCustomer) {
      // Mise à jour si le client existe
      await existingCustomer.update({
        firstName,
        lastName,
        gender,
        birthDate,
        birthPlace,
        nationality,
        profession,
        
        phone,
        email,
       
        updatedBy: req.user.id,
      });

      return res.status(200).json({ message: "Customer updated successfully", customer: existingCustomer });
    }

    // Création si le client n'existe pas
    const customer = await Customer.create({
      userId: req.user.id,
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      nationality,
      profession,
      
      phone,
      email,
      
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    console.error("createCustomer error:", error);
    return res.status(500).json({ error: "Failed to create or update customer" });
  }
};


const createCustomerData = async (req, res) => {
  const {
    firstName,
    lastName,phone,email,
    gender,
    birthDate,
    birthPlace,
    nationality,
    profession,
    typeDocument,
    numDocument,
  } = req.body;
   console.log('req.body:', req.body);
//console.log('req.file',req.file)
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing' });
    }
//      const documents = req.files?.map(file => ({
//  filename: file.originalname,
 // path: file.path,
//  mimetype: file.mimetype,
//})) || [];

    // Handle uploaded files
    // const documents = req.files && req.files.length > 0
     // ? req.files.map(file => file.path)
     // : [];
//   const documents = req.files?.map(file => file.path) || [];

    console.log('req.body:', req.body);
    //console.log('documents:', documents);

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
      phone,email,
      numDocument,
     // documents,
      createdBy: req.user.id,
    });

    return res.status(201).json({ message: "Customer created successfully", customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
};
const getAllCustomersWithoutRestriction = async (req, res) => {
  try {
    // Récupérer tous les clients sans filtre
    const customers = await Customer.findAll();

    // Vérifiez si des clients ont été trouvés
    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    // Retourner la liste de tous les clients
    return res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
};


// Obtenir tous les clients associés à l'utilisateur
const getAllCustomers = async (req, res) => {
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
   const updateCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const customer = await Customer.findOne({ where: { userId } });

    if (!customer) {
      return res.status(404).json({ 
        success: false,
        error: "Profil client non trouvé" 
      });
    }

    await customer.update({
      ...updateData,
      updatedBy: userId
    });

    return res.status(200).json({ 
      success: true,
      message: "Profil mis à jour avec succès",
      data: customer 
    });

  } catch (error) {
    console.error('Erreur updateCustomerProfile:', error);
    return res.status(500).json({ 
      success: false,
      error: "Erreur lors de la mise à jour" 
    });
  }
};
// Mettre à jour un client spécifique
const updateCustomerCor = async (req, res) => {
  try {
    console.log('Received body:', req.body);
    console.log('Received files:', req.files);

    const { 
      firstName, lastName, gender, birthDate, birthPlace, nationality, 
      profession, typeDocument, numDocument, phone, address,  
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`Looking for customer with userId: ${userId}`);
    const customer = await Customer.findOne({ where: { userId } });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const getUpdatedValue = (newValue, oldValue) => 
      newValue !== undefined && newValue !== "" ? newValue : oldValue;

 

    customer.update({
      firstName: getUpdatedValue(firstName, customer.firstName),
      lastName: getUpdatedValue(lastName, customer.lastName),
      gender: getUpdatedValue(gender, customer.gender),
      birthDate: getUpdatedValue(birthDate, customer.birthDate),
      birthPlace: getUpdatedValue(birthPlace, customer.birthPlace),
      nationality: getUpdatedValue(nationality, customer.nationality),
      profession: getUpdatedValue(profession, customer.profession),
      
      phone: getUpdatedValue(phone, customer.phone),
      email: getUpdatedValue(email, customer.email),

      address: getUpdatedValue(address, customer.address),
     
      updatedBy: req.user.id,
    });

    console.log("Customer updated:", customer);
    await customer.save();

    return res.status(200).json({ message: "Customer updated successfully", customer });

  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ error: "Failed to update customer" });
  }
};

// Supprimer un client
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findOne({ where: { id: parseInt(id), userId: req.user.id } });

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
const getCustomerInvoices = catchAsync(async (req, res) => {
  let whereCondition = {};

  // Vérifier si l'utilisateur est un Customer
  const customer = await Customer.findOne({ where: { userId: req.user.id } });

  if (customer) {
      whereCondition.customerId = customer.id;
  } else {
      // Vérifier si l'utilisateur est une Agency
      const agency = await Agency.findOne({ where: { userId: req.user.id } });
      if (agency) {
          whereCondition['$reservation.agencyId$'] = agency.id;
      } else {
          throw new AppError('No associated Customer or Agency found for this user', 404);
      }
  }

  const invoices = await Invoice.findAll({
      include: [
          {
              model: Reservation,
              as: 'reservation', // ✅ Correct
              include: [
                  { model: Destination, as: 'startDestination' }, // Destination de départ
                  { model: Destination, as: 'endDestination' }   // Destination d'arrivée
              ],
              required: true
          },
          {
              model: Customer,
              as: 'customer' // ✅ Correct
          },
          {
              model: Payment,
              as: 'payments' // ✅ Correction ici
          },
          
      ],
      where: whereCondition
  });

  res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: invoices
  });
});

module.exports = {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerById,getAllCustomersWithoutRestriction,getCustomerInvoices
};
