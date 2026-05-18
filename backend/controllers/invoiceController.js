//const { Invoice, Reservation, Customer, Payment } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Invoice=require('../models/invoice')
const Reservation=require('../models/booking')
const Customer=require('../models/customer')
const Payment=require('../models/payment');
const  Passenger  = require('../models/Passenger');
const Agency=require('../models/agenceModel')
const Destination=require('../models/destinationModel')
const Class=require('../models/classModel');
const Company = require('../models/Company');
const Vol=require('../models/volModel')
const NotificationService = require('../services/notification.service');
const  User  = require('../models/userModel');
const FlightAgency=require('../models/flightAgency')
const PaymentMode=require('../models/paymentMode')
const UserAgency=require('../models/userAgencies')

exports.createInvoice = catchAsync(async (req, res) => {
    const { reservationId, amount, dueDate } = req.body;
    
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
        throw new AppError('Reservation not found', 404);
    }

    const invoice = await Invoice.create({
        reservationId,
        customerId: reservation.customerId,
        amount:reservation.TotalPrice,
        dueDate,
        status: 'unpaid',
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: invoice
    });
});

// exports.getInvoices = async (req, res) => {
//     const invoices = await Invoice.findAll({
      
//         where:  { customerId: req.user.id } 
//     });

//     res.status(200).json({
//         status: 'success',
//         results: invoices.length,
//         data: invoices
//     });
// };
exports.getInvoices = async (req, res) => {
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
           where: whereCondition,
          include: [
            {
                model: Reservation,
                as: 'reservation', // ✅ Correct
                include: [
                    { model: Destination, as: 'startDestination' },
                    { model: Destination, as: 'endDestination' }
                ]
            },
            {
                model: Customer,
                as: 'customer' // ✅ Correct
            },
           
           
        ],order: [["createdAt", "DESC"]]
        
    });

    res.status(200).json({
        status: 'success',
        results: invoices.length,
        data: invoices
    });
};

const getUserAgency = async (userId) => {
    // Vérifier si l'utilisateur est le créateur d'une agence
    let agency = await Agency.findOne({ where: { userId } });

    if (!agency) {
        // Vérifier s'il est assigné à une agence
        const userAgency = await UserAgency.findOne({ where: { userId } });
        if (userAgency) {
            agency = await Agency.findOne({ where: { id: userAgency.agencyId } });
        }
    }

    return agency;
};

exports.getInvoicesForAgency = async (req, res) => {
    try {
        const userId = req.user.id;
        const agency = await getUserAgency(userId);

        if (!agency) {
            return res.status(404).json({ message: "No associated Agency found for this user" });
        }

        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Reservation,
                    as: "reservation",
                    where: { agencyId: agency.id },
                    include: [
                        { model: Destination, as: "startDestination" },
                        { model: Destination, as: "endDestination" }
                    ]
                },
                { model: Customer, as: "customer" }
            ],order: [["createdAt", "DESC"]]
        });

        res.status(200).json({
            status: "success",
            results: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error("❌ Error in getInvoicesForAgency:", error);
        res.status(500).json({ message: "Failed to retrieve agency invoices" });
    }
};

//     try {
//         const userId = req.user.id;

//         // Vérifier si l'utilisateur est créateur d'une agence
//         let agency = await Agency.findOne({ where: { userId } });

//         if (!agency) {
//             // Vérifier si l'utilisateur est assigné à une agence
//             const userAgency = await UserAgency.findOne({ where: { userId } });
//             if (!userAgency) {
//                 return res.status(404).json({ message: "No associated Agency found for this user" });
//             }
//             agency = await Agency.findOne({ where: { id: userAgency.agencyId } });
//         }

//         if (!agency) {
//             return res.status(404).json({ message: "No associated Agency found" });
//         }

//         // Récupérer les factures liées à l'agence
//         const invoices = await Invoice.findAll({
//             include: [
//                 {
//                     model: Reservation,
//                     as: "reservation",
//                     where: { agencyId: agency.id }, // Filtrer par l'ID de l'agence
//                     include: [
//                         { model: Destination, as: "startDestination" },
//                         { model: Destination, as: "endDestination" }
//                     ]
//                 },
//                 { model: Customer, as: "customer" }
//             ]
//         });

//         res.status(200).json({
//             status: "success",
//             results: invoices.length,
//             data: invoices
//         });
//     } catch (error) {
//         console.error("❌ Error in getInvoicesForAgency:", error);
//         res.status(500).json({ message: "Failed to retrieve agency invoices" });
//     }
// };
exports.getInvoicesForCustomer = async (req, res) => {
    try {
        const userId = req.user.id;
        const customer = await Customer.findOne({ where: { userId } });

        if (!customer) {
            return res.status(404).json({ message: "No associated Customer found for this user" });
        }

        const invoices = await Invoice.findAll({
             where: { customerId: customer.id },  
          include: [
                {
                    model: Reservation,
                    as: "reservation",
                    include: [
                        { model: Destination, as: "startDestination" },
                        { model: Destination, as: "endDestination" }
                    ]
                },
                { model: Customer, as: "customer" }
            ]
            ,order: ["createdAt", "DESC"]
            
        });

        res.status(200).json({
            status: "success",
            results: invoices.length,
            data: invoices
        });
    } catch (error) {
        console.error("❌ Error in getInvoicesForCustomer:", error);
        res.status(500).json({ message: "Failed to retrieve customer invoices" });
    }
};

// exports.getInvoice = async (req, res) => {
//     const invoice = await Invoice.findByPk(req.params.id, {
//         include: [
//             {
//                 model: Reservation,
//                 as: 'reservation',
//                 include: [
//                     { model: Destination, as: 'startDestination' },
//                     { model: Destination, as: 'endDestination' }
//                 ]
//             },
//             {
//                 model: Customer,
//                 as: 'customer'
//             },
//             {
//                 model: Payment,
//                 as: 'payments'
//             }
//         ]
//     });

//     if (!invoice) {
//         throw new AppError('Invoice not found', 404);
//     }

//     // Vérifier que l'utilisateur a le droit d'accéder à cette facture
//     // if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
//     //     throw new AppError('You are not authorized to view this invoice', 403);
//     // }

//     res.status(200).json({
//         status: 'success',
//         data: invoice
//     });
// };
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    include: [
                        { model: Destination, as: 'startDestination' },
                        { model: Destination, as: 'endDestination' },
                        { model: Passenger ,as:'passengers' }, // Inclure les passagers liés à la réservation
                         { model: Agency,as:'agencyReservations' ,include:[{model:FlightAgency,as:'agencyFlights'}]} // Inclure l'agence liée à la réservation,
                         ,
                    ]
                },
                {
                    model: Customer,
                    as: 'customer'
                },
                
                {
                    model: Payment,
                    as: 'payments'
                }
            ], order: [["createdAt", "DESC"]]
        });

        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.updateInvoice = catchAsync(async (req, res) => {
    const { status, dueDate } = req.body;
    
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        throw new AppError('Invoice not found', 404);
    }

    // Mise à jour des champs autorisés
    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = dueDate;
    
    invoice.updatedBy = req.user.id;
    await invoice.save();

    res.status(200).json({
        status: 'success',
        data: invoice
    });
});

exports.deleteInvoice = catchAsync(async (req, res) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        throw new AppError('Invoice not found', 404);
    }

    await invoice.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// exports.downloadInvoice = catchAsync(async (req, res) => {
//     const invoice = await Invoice.findByPk(req.params.id, {
//         include: [
//             {
//                 model: Reservation,
//                 as: 'reservation',
//                 include: ['destination']
//             },
//             {
//                 model: Customer,
//                 as: 'customer'
//             }
//         ]
//     });

//     if (!invoice) {
//         throw new AppError('Invoice not found', 404);
//     }

//     // Vérifier l'autorisation
//     if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
//         throw new AppError('You are not authorized to download this invoice', 403);
//     }

//     // Ici, vous pouvez implémenter la logique pour générer le PDF de la facture
//     // Pour l'exemple, nous renvoyons juste les données
//     res.status(200).json({
//         status: 'success',
//         data: invoice
//     });
// });

const PRIVATE_KEY = 'my_super_secure_private_key'; // À stocker en environnement sécurisé

// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [{model:FlightAgency,as:'vols',include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }]}
//                        ,
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '/uploads', agency.logo) : null;

//         // En-tête avec logo et informations de l'agence
//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         //doc.fontSize(20).fillColor('black').font('Helvetica-Bold').text(`FACTURE PROFORMA`, { align: 'center' }).moveDown();

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text(`AGENCE DE VOYAGE`, { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         // Détails de la réservation
//         doc.fontSize(14).fillColor('black').text(`Détails de la Réservation`, { underline: true }).moveDown(0.5);

//         const reservation = invoice.reservation;
//         console.log('reservation',reservation.vols)
//         if (reservation) {
//             doc.fontSize(12);
           
//             doc.text(`Vol: ${reservation.vols?.name || 'N/A'} - ${reservation.vol?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vol?.endDate || 'N/A'}`).moveDown();
//         }

//         // Détails des paiements
//         doc.fontSize(14).fillColor('black').text(`Détails des Paiements`, { underline: true }).moveDown(0.5);

//         if (invoice.payments.length > 0) {
//             doc.fontSize(12);
//             invoice.payments.forEach((payment, index) => {
//                 doc.text(
//                     `${index + 1}. Mode: ${payment.modePaymentId} | Montant: ${payment.amount.toFixed(2)} Fcfa | Réf: ${payment.reference} | Date: ${new Date(payment.paymentDate).toLocaleDateString()}`
//                 );
//             });
//         } else {
//             doc.text(`Aucun paiement enregistré.`);
//         }
//         doc.moveDown();

//         // Détails de la facture
//         doc.fontSize(14).fillColor('black').text(`Détails de la Facture`, { underline: true }).moveDown(0.5);

//         const tableTop = doc.y;
//         const columnWidths = [200, 80, 100, 100];
//         const headers = ["Nom du Passager", "Quantité", "Montant Unitaire TTC", "Montant TTC"];
//         let startX = 50;
//         let rowHeight = 30;
//         let startY = tableTop + 10;

//         // En-tête du tableau
//         doc.fillColor('white').rect(startX, startY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
//         doc.fillColor('white').fontSize(12).font('Helvetica-Bold');

//         headers.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, startY, { width: columnWidths[i], align: 'center' });
//         });

//         doc.strokeColor('black').lineWidth(1).rect(startX, startY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//         doc.moveDown();

//         let currentY = startY + rowHeight;
//         doc.font('Helvetica').fontSize(12);

//         invoice.reservation.passengers.forEach((passenger, index) => {
//             doc.fillColor(index % 2 === 0 ? 'lightgray' : 'white').rect(startX, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
//             doc.fillColor('black');

//             const row = [
//                 `${passenger.firstName} ${passenger.lastName}`,
//                 `1`,
//                 `${invoice.amount.toFixed(2)} Fcfa`,
//                 `${invoice.totalWithTax.toFixed(2)} Fcfa`
//             ];

//             row.forEach((text, i) => {
//                 doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5, currentY, { width: columnWidths[i], align: 'center' });
//             });

//             doc.strokeColor('black').rect(startX, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//             currentY += rowHeight;
//         });

//         doc.moveDown();

//         // Résumé du montant
//         doc.fontSize(12).font('Helvetica-Bold');
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y);
//         doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.text(`Net à Payer: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.moveDown();

//         doc.end();

//         stream.on('finish', () => {
//             res.download(filePath, `Invoice-${invoice.reference}.pdf`);
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };


// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text("AGENCE DE VOYAGE", { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
//         const reservation = invoice.reservation;

//         if (reservation) {
//             doc.fontSize(12);
//             doc.text(`Vol: ${reservation.vols?.flight?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vols?.flight?.endDate || 'N/A'}`).moveDown();
//         }

//         doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);

//         const tableTop = doc.y + 10;
//         const startX = 50;
//         const columnWidths = [250, 100, 100];
//         const rowHeight = 30;
//         const headers = ["Nom du Passager", "Montant Unitaire TTC", "Montant TTC"];

//         // Dessiner les en-têtes du tableau avec un fond bleu
//         doc.fillColor('blue')
//             .rect(startX, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//             .fill();
        
//         doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
//         headers.forEach((header, i) => {
//             doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, tableTop + 10, { width: columnWidths[i], align: 'center' });
//         });

//         // Bordure de l'en-tête
//         doc.strokeColor('black').lineWidth(1)
//             .rect(startX, tableTop, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//             .stroke();

//         let currentY = tableTop + rowHeight;

//         // Afficher les passagers
//         invoice.reservation.passengers.forEach((passenger, index) => {
//             const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
//             doc.fillColor(bgColor)
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .fill();
            
//             doc.fillColor('black').font('Helvetica').fontSize(12);
//             const row = [
//                 `${passenger.firstName} ${passenger.lastName}`,
//                 `${invoice.amount.toFixed(2)} Fcfa`,
//                 `${invoice.totalWithTax.toFixed(2)} Fcfa`
//             ];

//             row.forEach((text, i) => {
//                 doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, currentY + 10, { width: columnWidths[i], align: 'center' });
//             });

//             // Bordure de chaque ligne
//             doc.strokeColor('black')
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .stroke();

//             currentY += rowHeight;
//         });

//         doc.moveDown();

//         // Résumé du montant
//         doc.fontSize(12).font('Helvetica-Bold');
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y);
//         doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.text(`Net à Payer: ${invoice.totalWithTax.toFixed(2)} Fcfa`, 375, doc.y + 10);
//         doc.moveDown();

//         doc.end();

//         stream.on('finish', () => {
//             res.download(filePath, `Invoice-${invoice.reference}.pdf`);
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };

// exports.downloadInvoice = async (req, res) => {
//     try {
//         console.log('Invoice ID:', req.params.id);
        
//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
//                 },
//                 { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
//                 { model: Payment, as: 'payments' }
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Facture introuvable' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency?.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 });
//         }

//         if (agency) {
//             doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
//             doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
//             doc.fontSize(12).fillColor('black').font('Helvetica-Bold').text("AGENCE DE VOYAGE", { align: 'center' }).moveDown();
//         }

//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

//         doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
//         const reservation = invoice.reservation;

//         if (reservation) {
//             doc.fontSize(12);
//             doc.text(`Vol: ${reservation.vols?.flight?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
//             doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
//             doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
//             doc.text(`Date de vol: ${reservation.vols?.flight?.endDate || 'N/A'}`).moveDown();
//         }

//         doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);

//         const startX = 50;
//         const columnWidths = [250, 100, 100];
//         const rowHeight = 30;
//         let currentY = doc.y + 10;

//         invoice.reservation.passengers.forEach((passenger, index) => {
//             doc.fillColor(index % 2 === 0 ? 'lightgray' : 'white')
//                 .rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//                 .fill()
//                 .fillColor('black');
//             doc.text(`${passenger.firstName} ${passenger.lastName}`, startX + 10, currentY + 10, { width: columnWidths[0], align: 'center' });
//             doc.text(`${invoice.amount.toFixed(2)} Fcfa`, startX + columnWidths[0] + 10, currentY + 10, { width: columnWidths[1], align: 'center' });
//             doc.text(`${invoice.totalWithTax.toFixed(2)} Fcfa`, startX + columnWidths[0] + columnWidths[1] + 10, currentY + 10, { width: columnWidths[2], align: 'center' });
//             doc.strokeColor('black').rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
//             currentY += rowHeight;
//         });

//         doc.moveDown(2);
//         doc.fontSize(14).fillColor('black').text("Détails des Paiements", { underline: true }).moveDown(0.5);
//         const paymentColumnWidths = [150, 150, 150];
//         doc.fontSize(12).fillColor('black');
//         doc.text("Montant Payé", startX + 10, doc.y, { width: paymentColumnWidths[0], align: 'center' });
//         doc.text("Date de Paiement", startX + paymentColumnWidths[0] + 10, doc.y, { width: paymentColumnWidths[1], align: 'center' });
//         doc.text("Mode de Paiement", startX + paymentColumnWidths[0] + paymentColumnWidths[1] + 10, doc.y, { width: paymentColumnWidths[2], align: 'center' });
//         doc.moveDown(0.5);

//         invoice.payments.forEach((payment) => {
//             doc.text(`${payment.amount.toFixed(2)} Fcfa`, startX + 10, doc.y, { width: paymentColumnWidths[0], align: 'center' });
//             doc.text(`${new Date(payment.paymentDate).toLocaleDateString()}`, startX + paymentColumnWidths[0] + 10, doc.y, { width: paymentColumnWidths[1], align: 'center' });
//             doc.text(`${payment.paymentMethod || 'N/A'}`, startX + paymentColumnWidths[0] + paymentColumnWidths[1] + 10, doc.y, { width: paymentColumnWidths[2], align: 'center' });
//             doc.moveDown(0.5);
//         });

//         doc.end();
//         stream.on('finish', () => res.download(filePath, `Invoice-${invoice.reference}.pdf`));
//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };
exports.downloadInvoice = async (req, res) => {
  try {
   const invoice = await Invoice.findByPk(req.params.id,
 { include: [
 { model: Reservation, as: "reservation", include: [
 { model: FlightAgency, as: "vols", 
include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
 { model: Passenger, as: "passengers" },
 { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
 { model: Destination, as: "startDestination" },
 { model: Destination, as: "endDestination" } ], },
 { model: Customer, as: "customer", include: { model: User, as: "user" } },
 { model: Payment, as: "payments", include:[
 { model: PaymentMode, as: "paymentMode",attributes: [
        "id",
        "name",
        "organization",
        "type"
      ] } ]}, ], }); 

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // FONCTION POUR FORMATER LES MONTANTS
    // =========================
    //const formatAmount = (amount) => {
     // return new Intl.NumberFormat('fr-FR', {
      //  minimumFractionDigits: 0,
      //  maximumFractionDigits: 0
      //}).format(amount) + ' FCFA';
    //};
      const formatAmount = (amount) => {
  if (!amount) return "0 FCFA";

  return new Intl.NumberFormat('fr-FR')
    .format(amount)
    .replace(/\u202f/g, ' ') + ' FCFA';
};
    // =========================
    // EN-TÊTE AVEC LOGO, AGENCE À GAUCHE ET DÉTAILS FACTURE À DROITE
    // =========================
    let yPosition = 50;

    // Logo à gauche
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, yPosition, { width: 60, height: 60 });
    }

    // Titre principal centré
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24)
       .text("FACTURE", 50, yPosition, { align: "center", width: doc.page.width - 100 });

    // =========================
    // INFORMATIONS AGENCE (COLONNE GAUCHE)
    // =========================
    yPosition += 40;
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;

    doc.font("Helvetica-Bold").fontSize(12).text("AGENCE:", 50, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(agency?.name || "Agence Voyage", 50, yPosition + 15);
    doc.text(agency?.address || "Adresse inconnue", 50, yPosition + 30);
    doc.text(`Tél: ${agency?.phone1 || "N/A"}`, 50, yPosition + 45);
    doc.text(`Email: ${agencyUser?.email || "N/A"}`, 50, yPosition + 60);

    // =========================
    // INFORMATIONS FACTURE (COLONNE DROITE)
    // =========================
    const customer = invoice.customer;

    doc.font("Helvetica-Bold").fontSize(12).text("DÉTAILS FACTURE:", 350, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Référence: ${invoice.reference}`, 350, yPosition + 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, 350, yPosition + 30);
    doc.text(`Statut: ${invoice.status === 'paid' ? 'Payée' : 
                       invoice.status === 'partial' ? 'Partiellement payée' : 
                       invoice.status === 'unpaid' ? 'Impayée' : invoice.status}`, 350, yPosition + 45);

    if (customer) {
      doc.text(`Client: ${customer.user.name || ''} || ${customer.lastName || ''}`, 350, yPosition + 60);
    }

    // =========================
    // MODES DE PAIEMENT DISPONIBLES
    // =========================
    try {
      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
       }
      });
//const paymentModes=invoice.payments.paymentMode;
  console.log('paymentModes',paymentModes)
      if (paymentModes && paymentModes.length > 0) {

  yPosition += 90;

  doc.fontSize(10)
     .fillColor('black')
     .font('Helvetica-Bold')
     .text("MODES DE PAIEMENT ACCEPTÉS", 50, yPosition, { underline: true });

  let yMode = yPosition + 25;

  const typeLabels = {
    mobile_money: 'Mobile Money',
    bank: 'Virement bancaire',
    cash: 'Espèces',
    cheque: 'Chèque'
  };

  paymentModes.forEach((mode) => {

    const modeLabel = typeLabels[mode.type] || mode.type;

    const displayName = mode.organization || mode.name || modeLabel;

    const accountInfo = mode.accountNumber
      ? ` : ${mode.accountNumber}`
      : '';

    const defaultTag = mode.isDefault
      ? ' (Principal)'
      : '';

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#374151')
       .text(
         `- ${displayName}${accountInfo}${defaultTag}`,
         70,
         yMode,
         {
           width: doc.page.width - 140,
           align: 'left'
         }
       );

    yMode += 18;
  });

  yPosition = yMode + 10;
}

    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
// DÉTAILS DE LA RÉSERVATION
// =========================

yPosition = (yPosition > 140) ? yPosition : 140;
yPosition += 30;

doc
  .fontSize(10)
  .fillColor('black')
  .text("DÉTAILS DE LA RÉSERVATION", 50, yPosition, { underline: true });

const reservation = invoice.reservation;

if (reservation) {

  yPosition += 25;
  doc.fontSize(12);

  // Vérifier si vol existe
  const hasFlight = reservation.vols && reservation.vols.flight;

  if (hasFlight) {

    const companyName = reservation.vols.flight.companyVol?.name || "N/A";
    const flightNumber = reservation.vols.flight.flightNumber || "N/A";

    doc.text(
      `Vol: ${companyName} - ${flightNumber}`,
      50,
      yPosition
    );

    doc.text(
      `Départ: ${reservation.startDestination?.city || 'N/A'} (${reservation.startDestination?.country || 'N/A'})`,
      50,
      yPosition + 15
    );

    doc.text(
      `Arrivée: ${reservation.endDestination?.city || 'N/A'} (${reservation.endDestination?.country || 'N/A'})`,
      50,
      yPosition + 30
    );

    const departureTime = reservation.vols.departureTime;

    const formattedDateTime = departureTime
      ? new Date(departureTime).toLocaleString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "N/A";

    doc.text(
      `Date de vol: ${formattedDateTime}`,
      50,
      yPosition + 45
    );

    yPosition += 70;

  } else {

    // Cas demande simple sans vol
    doc.text(
      `Type: Demande de réservation`,
      50,
      yPosition
    );

    doc.text(
      `Départ: ${reservation.startDestination?.city || 'N/A'} (${reservation.startDestination?.country || 'N/A'})`,
      50,
      yPosition + 15
    );

    doc.text(
      `Arrivée: ${reservation.endDestination?.city || 'N/A'} (${reservation.endDestination?.country || 'N/A'})`,
      50,
      yPosition + 30
    );

    doc.text(
      `Statut: En attente de proposition de vol`,
      50,
      yPosition + 45
    );

    yPosition += 70;
  }
}

    // =========================
    // TABLEAU DES PASSAGERS AVEC HEADERS ORANGE
    // =========================
    doc.fontSize(12).fillColor('black').text("DÉTAILS DE LA FACTURE", 50, yPosition, { underline: true });

    const startX = 50;
    const columnWidths = [220, 120, 120];
    const rowHeight = 25;
    let y = yPosition + 25;

    // En-tête du tableau avec fond orange
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
        width: columnWidths[i]-10,
        align: i === 0 ? 'left' : 'right'
      });
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('black').font('Helvetica').fontSize(12);

    const passengers = invoice.reservation?.passengers || [];
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        const row = [
          `${passenger.firstName || ''} ${passenger.lastName || ''}`,
          formatAmount(invoice.amount),
          formatAmount(invoice.amount)
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: columnWidths[i],
            align: i === 0 ? 'left' : 'right'
          });
        });

        y += rowHeight;
      });
    } else {
      doc.text("Aucun passager enregistré", startX + 10, y + 7);
      y += rowHeight;
    }

    // =========================
    // TOTAUX SIMPLIFIÉS AVEC ENCADRÉ
    // =========================
    y += 30;

    const totalsStartX = 300;
    const labelWidth = 150;
    const valueWidth = 120;
    const rowSpacing = 22;

    // Calculs propres
    const totalHT = invoice.amount || 0;
    const totalTTC = invoice.amount || 0;

    const totalPaid = invoice.payments
      ? invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      : 0;

    const remainingBalance = totalTTC - totalPaid;

    // Encadré gris clair
    doc.roundedRect(totalsStartX - 20, y - 10, 300, 120, 6)
       .fillAndStroke('#f3f4f6', '#d1d5db');

    doc.fillColor('black').font('Helvetica-Bold').fontSize(12);

    let currentY = y;

    // Ligne helper
    const drawTotalLine = (label, value, isBold = false) => {
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(11)
         .fillColor('#111827')
         .text(label, totalsStartX, currentY, {
           width: labelWidth,
           align: 'left'
         });

      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(11)
         .fillColor(isBold ? '#b91c1c' : '#111827')
         .text(formatAmount(value), totalsStartX + labelWidth, currentY, {
           width: valueWidth,
           align: 'right'
         });

      currentY += rowSpacing;
    };

    // Lignes
    drawTotalLine("Total HT :", totalHT);
    drawTotalLine("Total TTC :", totalTTC);
    drawTotalLine("Déjà payé :", totalPaid);
    drawTotalLine("Solde restant :", remainingBalance, true);

    y = currentY + 20;

    // =========================
    // DÉTAILS DES PAIEMENTS OU MESSAGE SI AUCUN PAIEMENT
    // =========================
    if (invoice.payments && invoice.payments.length > 0) {

  doc.fontSize(14).fillColor('black')
     .text("DÉTAILS DES PAIEMENTS", 50, y, { underline: true });

  y += 25;

  const paymentStartX = 50;
  const paymentRowHeight = 28;

  // Largeurs adaptées à page A4 avec marges 50
  const paymentColumnWidths = [90, 110, 170, 85]; 
  const tableWidth = paymentColumnWidths.reduce((a, b) => a + b, 0);

  // ===== HEADER =====
  doc.rect(paymentStartX, y, tableWidth, paymentRowHeight)
     .fill('#D97706');

  doc.fillColor('white')
     .font('Helvetica-Bold')
     .fontSize(11);

  const headers = ["Date", "Montant", "Mode de Paiement", "Référence"];

  headers.forEach((header, i) => {
    const xOffset = paymentColumnWidths
      .slice(0, i)
      .reduce((a, b) => a + b, 0);

    doc.text(
      header,
      paymentStartX + xOffset + 5,
      y + 8,
      {
        width: paymentColumnWidths[i] - 10,
        align: i === 1 ? 'right' : 'left'
      }
    );
  });

  y += paymentRowHeight;

  // ===== LIGNES =====
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor('black');

  invoice.payments.forEach((payment, index) => {

    const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';

    doc.rect(paymentStartX, y, tableWidth, paymentRowHeight)
       .fill(bgColor);

    doc.fillColor('black');

    const paymentMode = payment?.paymentMode;
  console.log(
  JSON.stringify(invoice.payments, null, 2)
);
  //  const modeDisplay = paymentMode
    //  ? `${paymentMode.organization || paymentMode.name || paymentMode.type}`
      //: 'Non spécifié';
   const modeDisplay =
  payment?.paymentMode?.organization ||
  payment?.paymentMode?.name ||
  payment?.paymentMode?.type ||
  "Non spécifié";
    const row = [
      new Date(payment.paymentDate || payment.createdAt)
        .toLocaleDateString('fr-FR'),
      formatAmount(payment.amount),
      modeDisplay,
      payment.reference || 'N/A'
    ];

    row.forEach((text, i) => {

      const xOffset = paymentColumnWidths
        .slice(0, i)
        .reduce((a, b) => a + b, 0);

      doc.text(
        text,
        paymentStartX + xOffset + 5,
        y + 8,
        {
          width: paymentColumnWidths[i] - 10,
          align: i === 1 ? 'right' : 'left',
          lineBreak: false,
          ellipsis: true
        }
      );
    });

    y += paymentRowHeight;
  });
} else {
      // =========================
      // MESSAGE SI AUCUN PAIEMENT
      // =========================
y += 10;

// Encadré orange pour attirer l'attention
doc.roundedRect(80, y, doc.page.width - 160, 95, 8)
   .fillAndStroke('#fef3c7', '#D97706');

// Titre
doc.fillColor('#92400e')
   .fontSize(14)
   .font('Helvetica-Bold')
   .text(
     "AUCUN PAIEMENT EFFECTUÉ",
     100,
     y + 15,
     { align: 'center', width: doc.page.width - 200 }
   );

// Message
doc.fontSize(12)
   .font('Helvetica')
   .fillColor('#78350f')
   .text(
     "Pour finaliser votre réservation, veuillez contacter l'agence :",
     100,
     y + 40,
     { align: 'center', width: doc.page.width - 200 }
   );

// Coordonnées
doc.fontSize(11)
   .font('Helvetica-Bold')
   .fillColor('#78350f')
   .text(
     `Tél: ${agency?.phone1 || agency?.phone2 || 'N/A'}`,
     100,
     y + 65,
     { align: 'center', width: doc.page.width - 200 }
   )
   .text(
     `Email: ${agencyUser?.email || 'N/A'}`,
     100,
     y + 80,
     { align: 'center', width: doc.page.width - 200 }
   );

y += 115;

 }

    // =========================
    // PIED DE PAGE
    // =========================
   

    doc.end();
    
    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

exports.downloadInvoiceDernier = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        { 
          model: Payment, 
          as: "payments", 
          include: { 
            model: PaymentMode,  // Correction: PaymentMode (majuscule)
            as: "paymentMode" 
          } 
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // EN-TÊTE AVEC LOGO, AGENCE À GAUCHE ET DÉTAILS FACTURE À DROITE
    // =========================
    let yPosition = 50;

    // Logo à gauche
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, yPosition, { width: 60, height: 60 });
    }

    // Titre principal centré
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24)
       .text("FACTURE", 50, yPosition, { align: "center", width: doc.page.width - 100 });

    // =========================
    // INFORMATIONS AGENCE (COLONNE GAUCHE)
    // =========================
    yPosition += 40;
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;

    doc.font("Helvetica-Bold").fontSize(12).text("AGENCE:", 50, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(agency?.name || "Agence Voyage", 50, yPosition + 15);
    doc.text(agency?.address || "Adresse inconnue", 50, yPosition + 30);
    doc.text(`Tél: ${agency?.phone1 || "N/A"}`, 50, yPosition + 45);
    doc.text(`Email: ${agencyUser?.email || "N/A"}`, 50, yPosition + 60);

    // =========================
    // INFORMATIONS FACTURE (COLONNE DROITE)
    // =========================
    const customer = invoice.customer;

    doc.font("Helvetica-Bold").fontSize(12).text("DÉTAILS FACTURE:", 350, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Référence: ${invoice.reference}`, 350, yPosition + 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, 350, yPosition + 30);
    doc.text(`Statut: ${invoice.status.toUpperCase()}`, 350, yPosition + 45);

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, yPosition + 60);
    }

    // =========================
    // NOUVEAU: MODES DE PAIEMENT DISPONIBLES
    // =========================
    try {
      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        yPosition += 90;
        
        doc.fontSize(14).fillColor('black').text("MODES DE PAIEMENT ACCEPTÉS", 50, yPosition, { underline: true });
        
        let yMode = yPosition + 25;
        paymentModes.forEach((mode) => {
          // Icônes simples
          const modeIcon = mode.type === 'mobile_money' ? '📱' : 
                          mode.type === 'bank' ? '🏦' : 
                          mode.type === 'cash' ? '💵' : 
                          mode.type === 'cheque' ? '📝' : '💳';
          
          const modeText = `${modeIcon} ${mode.organization || mode.name || mode.type}`;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          const defaultTag = mode.isDefault ? ' (Principal)' : '';
          
          doc.font('Helvetica').fontSize(10).fillColor('#374151')
             .text(`• ${modeText}${accountInfo}${defaultTag}`, 70, yMode);
          yMode += 18;
        });
        
        yPosition = yMode + 10;
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
    // DÉTAILS DE LA RÉSERVATION
    // =========================
    yPosition = (yPosition > 140) ? yPosition : 140;
    yPosition += 30;
    
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA RÉSERVATION", 50, yPosition, { underline: true });

    const reservation = invoice.reservation;
    if (reservation) {
      yPosition += 25;
      
      doc.fontSize(12);
      doc.text(`Vol: ${reservation.vols?.flight?.companyVol?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`, 50, yPosition);
      doc.text(`Départ: ${reservation.startDestination?.city || 'N/A'} (${reservation.startDestination?.country || 'N/A'})`, 50, yPosition + 15);
      doc.text(`Arrivée: ${reservation.endDestination?.city || 'N/A'} (${reservation.endDestination?.country || 'N/A'})`, 50, yPosition + 30);

      const departureTime = reservation.vols?.departureTime;
      const formattedDateTime = departureTime
        ? new Date(departureTime).toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        : "N/A";

      doc.text(`Date de vol: ${formattedDateTime}`, 50, yPosition + 45);
      
      yPosition += 70;
    }

    // =========================
    // TABLEAU DES PASSAGERS AVEC HEADERS ORANGE
    // =========================
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA FACTURE", 50, yPosition, { underline: true });

    const startX = 50;
    const columnWidths = [200, 150, 150];
    const rowHeight = 25;
    let y = yPosition + 25;

    // En-tête du tableau avec fond orange
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
        width: columnWidths[i],
        align: i === 0 ? 'left' : 'right'
      });
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('black').font('Helvetica').fontSize(12);

    const passengers = invoice.reservation?.passengers || [];
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        const row = [
          `${passenger.firstName || ''} ${passenger.lastName || ''}`,
          `${invoice.amount.toFixed(2)} Fcfa`,
          `${invoice.amount.toFixed(2)} Fcfa`
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: columnWidths[i],
            align: i === 0 ? 'left' : 'right'
          });
        });

        y += rowHeight;
      });
    } else {
      doc.text("Aucun passager enregistré", startX + 10, y + 7);
      y += rowHeight;
    }

    // =========================
    // TOTAUX SIMPLIFIÉS (NET À PAYER)
    // =========================
    y += 20;
    
    doc.fontSize(12).font('Helvetica-Bold');

    // Positionner les totaux à droite
    const totalX = 375;

    doc.text(`Total Montant: ${invoice.amount.toFixed(2)} Fcfa`, totalX, y, { align: 'right' });
    doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, totalX, y + 20, { align: 'right' });
    doc.text(`Net à Payer: ${invoice.amount.toFixed(2)} Fcfa`, totalX, y + 40, { align: 'right' });

    y += 70;

    // =========================
    // DÉTAILS DES PAIEMENTS OU MESSAGE SI AUCUN PAIEMENT
    // =========================
    if (invoice.payments && invoice.payments.length > 0) {
      doc.fontSize(14).fillColor('black').text("DÉTAILS DES PAIEMENTS", 50, y, { underline: true });

      const paymentsTableHeaders = ["Date", "Montant", "Mode de Paiement", "Référence"];
      const paymentColumnWidths = [100, 120, 150, 130];
      y += 25;

      // En-tête du tableau des paiements avec fond orange
      doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

      paymentsTableHeaders.forEach((header, i) => {
        doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
          width: paymentColumnWidths[i],
          align: i === 1 ? 'right' : 'left'
        });
      });

      // Lignes des paiements
      y += rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(10);

      invoice.payments.forEach((payment, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        // Récupérer le mode de paiement utilisé
        const paymentMode = payment.paymentMode;
        const modeDisplay = paymentMode 
          ? `${paymentMode.organization || paymentMode.name || paymentMode.type}${paymentMode.accountNumber ? ` (${paymentMode.accountNumber})` : ''}`
          : 'Mode non spécifié';

        const row = [
          new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('fr-FR'),
          `${payment.amount.toFixed(2)} Fcfa`,
          modeDisplay,
          payment.reference || 'N/A'
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: paymentColumnWidths[i],
            align: i === 1 ? 'right' : 'left'
          });
        });

        y += rowHeight;
      });
    } else {
      // =========================
      // MESSAGE SI AUCUN PAIEMENT
      // =========================
      y += 10;
      
      // Encadré orange pour attirer l'attention
      doc.roundedRect(80, y, doc.page.width - 160, 90, 10)
         .fillAndStroke('#fef3c7', '#D97706');
      
      doc.fillColor('#92400e').fontSize(14).font('Helvetica-Bold')
         .text("⚠️ AUCUN PAIEMENT EFFECTUÉ", 100, y + 15, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(12).font('Helvetica')
         .text("Pour finaliser votre réservation, veuillez contacter l'agence :", 100, y + 40, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(11).font('Helvetica-Bold')
         .text(`📞 Tél: ${agency?.phone1 || agency?.phone2 || 'N/A'}`, 100, y + 65, { align: 'center', width: doc.page.width - 200 })
         .text(`✉️ Email: ${agencyUser?.email || 'N/A'}`, 100, y + 80, { align: 'center', width: doc.page.width - 200 });
      
      y += 110;
    }

    // =========================
    // PIED DE PAGE
    // =========================
    doc.fontSize(10).fillColor('gray')
       .text("Nous apprécions votre clientèle.", 50, 750, { align: 'center' })
       .text("Si vous avez des questions sur cette facture, n'hésitez pas à nous contacter.", 50, 765, { align: 'center' });

    doc.end();
    
    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

exports.downloadInvoiceNon = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        {
          model: Payment,
          as: "payments",
          include: {
            model: PaymentMode,
            as: "paymentMode",
            attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
          }
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // EN-TÊTE AVEC LOGO, AGENCE À GAUCHE ET DÉTAILS FACTURE À DROITE
    // =========================
    let yPosition = 50;

    // Logo à gauche
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, yPosition, { width: 60, height: 60 });
    }

    // Titre principal centré
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24)
       .text("FACTURE", 50, yPosition, { align: "center", width: doc.page.width - 100 });

    // =========================
    // INFORMATIONS AGENCE (COLONNE GAUCHE)
    // =========================
    yPosition += 40;
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;

    doc.font("Helvetica-Bold").fontSize(12).text("AGENCE:", 50, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(agency?.name || "Agence Voyage", 50, yPosition + 15);
    doc.text(agency?.address || "Adresse inconnue", 50, yPosition + 30);
    doc.text(`Tél: ${agency?.phone1 || "N/A"}`, 50, yPosition + 45);
    doc.text(`Email: ${agencyUser?.email || "N/A"}`, 50, yPosition + 60);

    // =========================
    // INFORMATIONS FACTURE (COLONNE DROITE)
    // =========================
    const customer = invoice.customer;

    doc.font("Helvetica-Bold").fontSize(12).text("DÉTAILS FACTURE:", 350, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Référence: ${invoice.reference}`, 350, yPosition + 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, 350, yPosition + 30);
    doc.text(`Statut: ${invoice.status.toUpperCase()}`, 350, yPosition + 45);

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, yPosition + 60);
    }

    // =========================
    // MODES DE PAIEMENT DISPONIBLES
    // =========================
    try {
      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        yPosition += 90;
        
        doc.fontSize(14).fillColor('black').text("MODES DE PAIEMENT ACCEPTÉS", 50, yPosition, { underline: true });
        
        let yMode = yPosition + 25;
        paymentModes.forEach((mode) => {
          const modeIcon = mode.type === 'mobile_money' ? '📱' : 
                          mode.type === 'bank' ? '🏦' : 
                          mode.type === 'cash' ? '💵' : 
                          mode.type === 'cheque' ? '📝' : '💳';
          
          const modeText = `${modeIcon} ${mode.organization || mode.name || mode.type}`;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          
          doc.font('Helvetica').fontSize(10).fillColor('#374151')
             .text(`• ${modeText}${accountInfo}`, 70, yMode);
          yMode += 18;
        });
        
        yPosition = yMode;
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
    // DÉTAILS DE LA RÉSERVATION
    // =========================
    yPosition += 20;
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA RÉSERVATION", 50, yPosition, { underline: true }).moveDown(0.5);

    const reservation = invoice.reservation;
    if (reservation) {
      yPosition += 25;
      
      doc.fontSize(12);
      doc.text(`Vol: ${reservation.vols?.flight?.companyVol?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`, 50, yPosition);
      doc.text(`Départ: ${reservation.startDestination?.city || 'N/A'} (${reservation.startDestination?.country || 'N/A'})`, 50, yPosition + 15);
      doc.text(`Arrivée: ${reservation.endDestination?.city || 'N/A'} (${reservation.endDestination?.country || 'N/A'})`, 50, yPosition + 30);

      const departureTime = reservation.vols?.departureTime;
      const formattedDateTime = departureTime
        ? new Date(departureTime).toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        : "N/A";

      doc.text(`Date de vol: ${formattedDateTime}`, 50, yPosition + 45).moveDown();
      
      yPosition += 60;
    }

    // =========================
    // TABLEAU DES PASSAGERS AVEC HEADERS ORANGE
    // =========================
    yPosition += 10;
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA FACTURE", 50, yPosition, { underline: true }).moveDown(0.5);

    const startX = 50;
    const columnWidths = [200, 150, 150];
    const rowHeight = 25;
    let y = doc.y; // ICI on utilise doc.y après le texte

    // En-tête du tableau avec fond orange
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
        width: columnWidths[i],
        align: i === 0 ? 'left' : 'right'
      });
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('black').font('Helvetica').fontSize(12);

    const passengers = reservation?.passengers || [];
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        const row = [
          `${passenger.firstName || ''} ${passenger.lastName || ''}`,
          `${invoice.amount.toFixed(2)} Fcfa`,
          `${invoice.amount.toFixed(2)} Fcfa`
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: columnWidths[i],
            align: i === 0 ? 'left' : 'right'
          });
        });

        y += rowHeight;
      });
    } else {
      doc.text("Aucun passager enregistré", startX + 10, y + 7);
      y += rowHeight;
    }

    // =========================
    // TOTAUX SIMPLIFIÉS (NET À PAYER) - VERSION ORIGINALE QUI MARCHAIT
    // =========================
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold');

    // Positionner les totaux à droite
    const totalX = 375;
    let totalY = doc.y;  // ICI on utilise doc.y qui est la position après le tableau

    doc.text(`Total Montant: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;

    doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;

    doc.text(`Net à Payer: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });

    doc.moveDown();
    let yAfterTotals = doc.y; // Sauvegarde de la position après les totaux

    // =========================
    // DÉTAILS DES PAIEMENTS AVEC HEADERS ORANGE
    // =========================
    if (invoice.payments && invoice.payments.length > 0) {
      doc.fontSize(14).fillColor('black').text("DÉTAILS DES PAIEMENTS", 50, yAfterTotals + 20, { underline: true }).moveDown(0.5);

      const paymentsTableHeaders = ["Date", "Montant", "Mode de Paiement", "Référence"];
      const paymentColumnWidths = [100, 100, 150, 150];
      y = doc.y; // Nouvelle position Y

      // En-tête du tableau des paiements avec fond orange
      doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

      paymentsTableHeaders.forEach((header, i) => {
        doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
          width: paymentColumnWidths[i],
          align: i === 0 ? 'left' : 'center'
        });
      });

      // Lignes des paiements
      y += rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(10);

      invoice.payments.forEach((payment, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        // Récupérer les informations du mode de paiement
        const paymentMode = payment.paymentMode;
        const modeDisplay = paymentMode
          ? `${paymentMode.organization || paymentMode.name || paymentMode.type} ${paymentMode.accountNumber ? `(${paymentMode.accountNumber})` : ''}`
          : 'Mode non spécifié';

        const row = [
          new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('fr-FR'),
          `${payment.amount.toFixed(2)} Fcfa`,
          modeDisplay,
          payment.reference || 'N/A'
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: paymentColumnWidths[i],
            align: i === 0 ? 'left' : i === 1 ? 'right' : 'center'
          });
        });

        y += rowHeight;
      });
    } else {
      // =========================
      // MESSAGE SI AUCUN PAIEMENT
      // =========================
      doc.moveDown(2);
      
      // Encadré orange pour attirer l'attention
      doc.rect(80, yAfterTotals + 40, doc.page.width - 160, 80).fillAndStroke('#fef3c7', '#D97706');
      doc.fillColor('#92400e').fontSize(14).font('Helvetica-Bold');
      
      const messageY = yAfterTotals + 55;
      doc.text("⚠️ AUCUN PAIEMENT EFFECTUÉ", 100, messageY, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(12).font('Helvetica');
      doc.text("Pour finaliser votre réservation, veuillez contacter l'agence :", 100, messageY + 25, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(`📞 Tél: ${agency?.phone1 || agency?.phone2 || 'N/A'}`, 100, messageY + 50, { align: 'center', width: doc.page.width - 200 });
      doc.text(`✉️ Email: ${agencyUser?.email || 'N/A'}`, 100, messageY + 70, { align: 'center', width: doc.page.width - 200 });
    }

    // =========================
    // PIED DE PAGE
    // =========================
    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text("Nous apprécions votre clientèle.", { align: 'center' });
    doc.text("Si vous avez des questions sur cette facture, n'hésitez pas à nous contacter.", { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};


exports.downloadInvoice6 = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        {
          model: Payment,
          as: "payments",
          include: {
            model: PaymentMode,
            as: "paymentMode",
            attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
          }
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // FONCTION POUR FORMATER LES MONTANTS
    // =========================
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' FCFA';
    };

    // =========================
    // EN-TÊTE
    // =========================
    // Logo
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }

    // Titre FACTURE
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('FACTURE', 0, 50, { align: 'center' });

    // =========================
    // INFORMATIONS AGENCE (GAUCHE)
    // =========================
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;
    const customer = invoice.customer;

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('AGENCE', 50, 140);

    doc.font('Helvetica')
       .fontSize(9)
       .text(agency?.name || 'Agence non spécifiée', 50, 155)
       .text(agency?.address || 'Adresse non disponible', 50, 170)
       .text(`Tél: ${agency?.phone1 || 'Non disponible'}`, 50, 185)
       .text(`Email: ${agencyUser?.email || 'Non disponible'}`, 50, 200);

    // =========================
    // DÉTAILS FACTURE (DROITE)
    // =========================
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('DÉTAILS FACTURE', 350, 140);

    doc.font('Helvetica')
       .fontSize(9)
       .text(`Référence: ${invoice.reference}`, 350, 155)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 350, 170);

    const statusText = {
      paid: 'Payée',
      partial: 'Partiellement payée',
      unpaid: 'Impayée',
      overdue: 'En retard'
    };
    doc.text(`Statut: ${statusText[invoice.status] || invoice.status}`, 350, 185);

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, 200);
    }

    // =========================
    // MODES DE PAIEMENT
    // =========================
    try {
      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('MODES DE PAIEMENT ACCEPTÉS', 50, 230, { underline: true });

        let yMode = 255;
        paymentModes.forEach((mode, index) => {
          const organization = mode.organization || mode.name || mode.type;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          
          doc.font('Helvetica')
             .fontSize(10)
             .text(`• ${organization}${accountInfo}`, 70, yMode + (index * 18));
        });
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
    // DÉTAILS RÉSERVATION
    // =========================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DÉTAILS DE LA RÉSERVATION', 50, 310, { underline: true });

    const reservation = invoice.reservation;
    if (reservation) {
      const companyName = reservation.vols?.flight?.companyVol?.name || 'N/A';
      
      doc.font('Helvetica')
         .fontSize(10)
         .text(`Compagnie: ${companyName}`, 50, 335)
         .text(`Départ: ${reservation.startDestination?.city || ''} ${reservation.startDestination?.country ? `(${reservation.startDestination.country})` : ''}`, 50, 350)
         .text(`Arrivée: ${reservation.endDestination?.city || ''} ${reservation.endDestination?.country ? `(${reservation.endDestination.country})` : ''}`, 50, 365);

      if (reservation.vols?.departureTime) {
        const departureDate = new Date(reservation.vols.departureTime);
        const formattedDate = departureDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Date de vol: ${formattedDate}`, 50, 380);
      }
    }

    // =========================
    // TABLEAU DES PASSAGERS
    // =========================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DÉTAILS DE LA FACTURE', 50, 410, { underline: true });

    // En-tête du tableau
    const startX = 50;
    const col1 = 200; // Nom
    const col2 = 150; // Montant Unitaire
    const col3 = 150; // Montant Total
    
    doc.rect(startX, 435, col1 + col2 + col3, 25).fill('#f59e0b');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Nom du Passager', startX + 10, 442)
       .text('Montant Unitaire', startX + col1 + 10, 442, { align: 'right', width: col2 - 20 })
       .text('Montant Total', startX + col1 + col2 + 10, 442, { align: 'right', width: col3 - 20 });

    // Lignes des passagers
    doc.fillColor('#000000')
       .font('Helvetica')
       .fontSize(10);

    const passengers = reservation?.passengers || [];
    let yPassenger = 460;
    
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, yPassenger - 3, col1 + col2 + col3, 22).fill('#f9fafb');
        }

        const passengerName = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || 'Nom non spécifié';
        const amount = formatAmount(invoice.amount);

        doc.fillColor('#000000')
           .text(passengerName, startX + 10, yPassenger)
           .text(amount, startX + col1 + 10, yPassenger, { align: 'right', width: col2 - 20 })
           .text(amount, startX + col1 + col2 + 10, yPassenger, { align: 'right', width: col3 - 20 });

        yPassenger += 22;
      });
    } else {
      doc.text('Aucun passager', startX + 10, yPassenger);
      yPassenger += 22;
    }

    // =========================
    // SECTION CRITIQUE: TOTAUX avec positions FIXES
    // =========================
    // 👉 ICI on définit une position Y FIXE pour les totaux
    const yTotals = 600; // Position Y fixe pour les totaux

    // LIGNE DE DÉBOGAGE - À SUPPRIMER APRÈS TEST
    doc.fontSize(8).fillColor('red').text(`Position Y des totaux: ${yTotals}`, 50, 580);

    // Libellés des totaux (côté gauche)
    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#000000')
       .text('Total HT:', 350, yTotals, { align: 'right' })
       .text('Total TTC:', 350, yTotals + 20, { align: 'right' })
       .text('Déjà payé:', 350, yTotals + 40, { align: 'right' })
       .text('Solde restant:', 350, yTotals + 60, { align: 'right' });

    // Valeurs des totaux (côté droit)
    doc.font('Helvetica-Bold')
       .fillColor('#000000')
       .text(formatAmount(invoice.amount), 500, yTotals, { align: 'right' })
       .text(formatAmount(invoice.amount), 500, yTotals + 20, { align: 'right' })
       .fillColor('#10b981')
       .text(formatAmount(invoice.paid || 0), 500, yTotals + 40, { align: 'right' })
       .fillColor('#f59e0b')
       .text(formatAmount(invoice.balance), 500, yTotals + 60, { align: 'right' });

    // =========================
    // PAIEMENTS
    // =========================
    let yPayments = yTotals + 100;

    if (invoice.payments && invoice.payments.length > 0) {
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('DÉTAILS DES PAIEMENTS', 50, yPayments, { underline: true });

      yPayments += 25;

      // En-tête tableau paiements
      doc.rect(startX, yPayments, 500, 25).fill('#f59e0b');
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Date', startX + 10, yPayments + 7)
         .text('Montant', startX + 110, yPayments + 7, { align: 'right', width: 100 })
         .text('Mode de Paiement', startX + 220, yPayments + 7)
         .text('Référence', startX + 400, yPayments + 7);

      yPayments += 25;
      doc.fillColor('#000000')
         .font('Helvetica')
         .fontSize(9);

      invoice.payments.forEach((payment, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, yPayments - 3, 500, 22).fill('#f9fafb');
        }

        const paymentDate = payment.paymentDate || payment.createdAt;
        const formattedDate = new Date(paymentDate).toLocaleDateString('fr-FR');
        
        const paymentMode = payment.paymentMode;
        let modeDisplay = 'Non spécifié';
        if (paymentMode) {
          modeDisplay = paymentMode.organization || paymentMode.name || paymentMode.type;
        }

        doc.fillColor('#000000')
           .text(formattedDate, startX + 10, yPayments)
           .text(formatAmount(payment.amount), startX + 110, yPayments, { align: 'right', width: 100 })
           .text(modeDisplay, startX + 220, yPayments, { width: 170 })
           .text(payment.reference || 'N/A', startX + 400, yPayments, { width: 90 });

        yPayments += 22;
      });
    } else {
      // Message si aucun paiement
      doc.roundedRect(80, yPayments, 450, 80, 10)
         .fillAndStroke('#fef3c7', '#f59e0b');
      
      doc.fillColor('#92400e')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('⚠️ AUCUN PAIEMENT EFFECTUÉ', 100, yPayments + 15, { align: 'center' });
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('Contactez l\'agence pour effectuer le paiement', 100, yPayments + 40, { align: 'center' })
         .text(`Tél: ${agency?.phone1 || 'Non disponible'} - Email: ${agencyUser?.email || 'Non disponible'}`, 100, yPayments + 60, { align: 'center' });
    }

    // =========================
    // PIED DE PAGE
    // =========================
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Nous apprécions votre clientèle.', 50, 750, { align: 'center' })
       .text('Pour toute question, contactez notre service client.', 50, 765, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};
exports.downloadInvoice5 = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        {
          model: Payment,
          as: "payments",
          include: {
            model: PaymentMode,
            as: "paymentMode",
            attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
          }
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // FONCTION POUR FORMATER LES MONTANTS
    // =========================
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' FCFA';
    };

    // =========================
    // ÉTAPE 1: EN-TÊTE (positions fixes)
    // =========================
    // Logo
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }

    // Titre FACTURE
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('FACTURE', 50, 50, { align: 'center' });

    // =========================
    // ÉTAPE 2: INFORMATIONS AGENCE (positions fixes)
    // =========================
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;
    const customer = invoice.customer;

    // AGENCE à gauche
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('AGENCE', 50, 140);

    doc.font('Helvetica')
       .fontSize(9)
       .text(agency?.name || 'Agence non spécifiée', 50, 155)
       .text(agency?.address || 'Adresse non disponible', 50, 170)
       .text(`Tél: ${agency?.phone1 || 'Non disponible'}`, 50, 185)
       .text(`Email: ${agencyUser?.email || 'Non disponible'}`, 50, 200);

    // DÉTAILS FACTURE à droite
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('DÉTAILS FACTURE', 350, 140);

    doc.font('Helvetica')
       .fontSize(9)
       .text(`Référence: ${invoice.reference}`, 350, 155)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 350, 170);

    // Statut
    const statusText = {
      paid: 'Payée',
      partial: 'Partiellement payée',
      unpaid: 'Impayée',
      overdue: 'En retard'
    };
    doc.text(`Statut: ${statusText[invoice.status] || invoice.status}`, 350, 185);

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, 200);
    }

    // =========================
    // ÉTAPE 3: MODES DE PAIEMENT (positions fixes)
    // =========================
    try {
      const paymentModes = await PaymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('MODES DE PAIEMENT ACCEPTÉS', 50, 230, { underline: true });

        let yMode = 255;
        paymentModes.forEach((mode, index) => {
          // Remplacer les icônes par du texte simple pour éviter les problèmes d'encodage
          const modeType = mode.type === 'mobile_money' ? 'Mobile Money' :
                          mode.type === 'bank' ? 'Banque' :
                          mode.type === 'cash' ? 'Espèces' :
                          mode.type === 'cheque' ? 'Chèque' : 'Paiement';
          
          const organization = mode.organization || mode.name || modeType;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          const defaultTag = mode.isDefault ? ' (Défaut)' : '';
          
          doc.font('Helvetica')
             .fontSize(10)
             .text(`• ${organization}${accountInfo}${defaultTag}`, 70, yMode + (index * 18));
        });
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
    // ÉTAPE 4: DÉTAILS RÉSERVATION
    // =========================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DÉTAILS DE LA RÉSERVATION', 50, 310, { underline: true });

    const reservation = invoice.reservation;
    if (reservation) {
      const companyName = reservation.vols?.flight?.companyVol?.name || 'N/A';
      
      doc.font('Helvetica')
         .fontSize(10)
         .text(`Compagnie: ${companyName}`, 50, 335)
         .text(`Départ: ${reservation.startDestination?.city || ''} ${reservation.startDestination?.country ? `(${reservation.startDestination.country})` : ''}`, 50, 350)
         .text(`Arrivée: ${reservation.endDestination?.city || ''} ${reservation.endDestination?.country ? `(${reservation.endDestination.country})` : ''}`, 50, 365);

      if (reservation.vols?.departureTime) {
        const departureDate = new Date(reservation.vols.departureTime);
        const formattedDate = departureDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Date de vol: ${formattedDate}`, 50, 380);
      }
    }

    // =========================
    // ÉTAPE 5: TABLEAU DES PASSAGERS
    // =========================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DÉTAILS DE LA FACTURE', 50, 410, { underline: true });

    // En-tête du tableau
    const startX = 50;
    const col1 = 200; // Nom
    const col2 = 150; // Montant Unitaire
    const col3 = 150; // Montant Total
    
    doc.rect(startX, 435, col1 + col2 + col3, 25).fill('#f59e0b');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Nom du Passager', startX + 10, 442)
       .text('Montant Unitaire', startX + col1 + 10, 442, { align: 'right', width: col2 - 20 })
       .text('Montant Total', startX + col1 + col2 + 10, 442, { align: 'right', width: col3 - 20 });

    // Lignes des passagers
    doc.fillColor('#000000')
       .font('Helvetica')
       .fontSize(10);

    const passengers = reservation?.passengers || [];
    let yPassenger = 460;
    
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, yPassenger - 3, col1 + col2 + col3, 22).fill('#f9fafb');
        }

        const passengerName = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || 'Nom non spécifié';
        const amount = formatAmount(invoice.amount);

        doc.fillColor('#000000')
           .text(passengerName, startX + 10, yPassenger)
           .text(amount, startX + col1 + 10, yPassenger, { align: 'right', width: col2 - 20 })
           .text(amount, startX + col1 + col2 + 10, yPassenger, { align: 'right', width: col3 - 20 });

        yPassenger += 22;
      });
    } else {
      doc.text('Aucun passager', startX + 10, yPassenger);
      yPassenger += 22;
    }

    // =========================
    // ÉTAPE 6: TOTAUX (TRÈS IMPORTANT - POSITIONS FIXES)
    // =========================
    // Ces lignes DOIVENT apparaître
    let yTotals = yPassenger + 20;
    
    // Libellés
    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#000000')
       .text('Total HT:', 350, yTotals)
       .text('Total TTC:', 350, yTotals + 20)
       .text('Déjà payé:', 350, yTotals + 40)
       .text('Solde restant:', 350, yTotals + 60);

    // Valeurs
    doc.font('Helvetica-Bold')
       .text(formatAmount(invoice.amount), 500, yTotals, { align: 'right' })
       .text(formatAmount(invoice.amount), 500, yTotals + 20, { align: 'right' })
       .fillColor('#10b981')
       .text(formatAmount(invoice.paid || 0), 500, yTotals + 40, { align: 'right' })
       .fillColor('#f59e0b')
       .text(formatAmount(invoice.balance), 500, yTotals + 60, { align: 'right' });

    // =========================
    // ÉTAPE 7: PAIEMENTS
    // =========================
    let yPayments = yTotals + 100;

    if (invoice.payments && invoice.payments.length > 0) {
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('DÉTAILS DES PAIEMENTS', 50, yPayments, { underline: true });

      yPayments += 25;

      // En-tête tableau paiements
      doc.rect(startX, yPayments, 500, 25).fill('#f59e0b');
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Date', startX + 10, yPayments + 7)
         .text('Montant', startX + 110, yPayments + 7, { align: 'right', width: 100 })
         .text('Mode de Paiement', startX + 220, yPayments + 7)
         .text('Référence', startX + 400, yPayments + 7);

      yPayments += 25;
      doc.fillColor('#000000')
         .font('Helvetica')
         .fontSize(9);

      invoice.payments.forEach((payment, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, yPayments - 3, 500, 22).fill('#f9fafb');
        }

        const paymentDate = payment.paymentDate || payment.createdAt;
        const formattedDate = new Date(paymentDate).toLocaleDateString('fr-FR');
        
        const paymentMode = payment.paymentMode;
        let modeDisplay = 'Non spécifié';
        if (paymentMode) {
          modeDisplay = paymentMode.organization || paymentMode.name || paymentMode.type;
        }

        doc.fillColor('#000000')
           .text(formattedDate, startX + 10, yPayments)
           .text(formatAmount(payment.amount), startX + 110, yPayments, { align: 'right', width: 100 })
           .text(modeDisplay, startX + 220, yPayments, { width: 170 })
           .text(payment.reference || 'N/A', startX + 400, yPayments, { width: 90 });

        yPayments += 22;
      });
    } else {
      // Message si aucun paiement
      doc.roundedRect(80, yPayments, 450, 80, 10)
         .fillAndStroke('#fef3c7', '#f59e0b');
      
      doc.fillColor('#92400e')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('⚠️ AUCUN PAIEMENT EFFECTUÉ', 100, yPayments + 15, { align: 'center' });
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('Contactez l\'agence pour effectuer le paiement', 100, yPayments + 40, { align: 'center' })
         .text(`Tél: ${agency?.phone1 || 'Non disponible'} - Email: ${agencyUser?.email || 'Non disponible'}`, 100, yPayments + 60, { align: 'center' });
    }

    // =========================
    // ÉTAPE 8: PIED DE PAGE
    // =========================
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Nous apprécions votre clientèle.', 50, 750, { align: 'center' })
       .text('Pour toute question, contactez notre service client.', 50, 765, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};
exports.downloadInvoiceTest = async (req, res) => {
    try {
        console.log('Invoice ID:', req.params.id);

        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Reservation,
                    as: 'reservation',
                    include: [
                        { model: FlightAgency, as: 'vols', include: [{ model: Vol, as: 'flight', include: { model: Company, as: 'companyVol' } }] },
                        { model: Passenger, as: 'passengers' },
                        { model: Agency, as: 'agencyReservations',include:{model:User,as:'User'} },
                        { model: Destination, as: 'startDestination' },
                        { model: Destination, as: 'endDestination' }
                    ],
                },
                { model: Customer, as: 'customer', include: { model: User, as: 'user' } },
                { model: Payment, as: 'payments',include:{model:paymentMode,as:'paymentMode'} }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Facture introuvable' });
        }
// console.log('paymentMode',invoice.payments)
// console.log('paymentMode',invoice.payments.paymentMode)

        const invoicesDir = path.join(__dirname, '../secure_invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // En-tête de l'agence
        const agency = invoice.reservation?.agencyReservations;
        if (agency) {
            doc.fontSize(20).fillColor('blue').font('Helvetica-Bold').text(agency.name, { align: 'center' });
            doc.fontSize(10).fillColor('black').text(`${agency.address || 'N/A'} - ${agency.phone || 'N/A'}`, { align: 'center' }).moveDown();
        }

        // Informations facture
        doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
        doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
        doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();

        // Détails de la réservation
        doc.fontSize(14).fillColor('black').text("Détails de la Réservation", { underline: true }).moveDown(0.5);
        const reservation = invoice.reservation;
        // console.log('invoicesFlight',reservation.vols)
        // console.log('invoicesvol',reservation.vols.flight)
        if (reservation) {
            doc.fontSize(12);
            doc.text(`Vol: ${reservation.vols?.flight?.companyVol.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
            doc.text(`Departure: ${reservation.startDestination?.country || 'N/A'}`);
            doc.text(`Arrival: ${reservation.endDestination?.country || 'N/A'}`);
            const departureTime = reservation.vols?.departureTime;
const formattedDateTime = departureTime 
    ? new Date(departureTime).toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) 
    : "N/A";

doc.text(`Date de vol: ${formattedDateTime}`).moveDown();

        }

        // Table des passagers
        doc.fontSize(14).fillColor('black').text("Détails de la Facture", { underline: true }).moveDown(0.5);
        
        const startX = 50;
        const columnWidths = [200, 150, 150];
        const rowHeight = 25;
        let y = doc.y;

        // En-tête du tableau
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
        const headers = ["Nom du Passager", "Montant Unitaire ", "Montant Total"];
        headers.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: columnWidths[i], align: 'center' });
        });

        // Lignes des passagers
        y += rowHeight;
        doc.fillColor('black').font('Helvetica').fontSize(12);
        invoice.reservation.passengers.forEach((passenger, index) => {
            const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
            doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
            doc.fillColor('black');

            const row = [
                `${passenger.firstName} ${passenger.lastName}`,
                `${invoice.amount.toFixed(2)} Fcfa`,
                `${invoice.amount.toFixed(2)} Fcfa`
            ];
            row.forEach((text, i) => {
                doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: columnWidths[i], align: 'center' });
            });

            y += rowHeight;
        });

        // Totaux
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Montant: ${invoice.amount.toFixed(2)} Fcfa`, 375, doc.y);
        doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, 375, doc.y + 10);
        doc.text(`Net à Payer: ${invoice.amount.toFixed(2)} Fcfa`, 375, doc.y + 10);
        doc.moveDown();

        // Détails des paiements
        doc.fontSize(14).fillColor('black').text("Détails des Paiements", { underline: true }).moveDown(0.5);

        const paymentsTableHeaders = ["Montant Payé", "Date de Paiement", "Reference Pay"];
        const paymentColumnWidths = [200, 150, 150];
        y = doc.y;

        // En-tête du tableau des paiements
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('blue');
        doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
        paymentsTableHeaders.forEach((header, i) => {
            doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: paymentColumnWidths[i], align: 'center' });
        });

        // Lignes des paiements
        y += rowHeight;
        doc.fillColor('black').font('Helvetica').fontSize(12);
        invoice.payments.forEach((payment, index) => {
            const bgColor = index % 2 === 0 ? 'lightgray' : 'white';
            doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
            doc.fillColor('black');

            const row = [
                `${payment.amount.toFixed(2)} Fcfa`,
                new Date(payment.paymentDate).toLocaleDateString(),
                payment.reference || 'N/A'
            ];
            row.forEach((text, i) => {
                doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { width: paymentColumnWidths[i], align: 'center' });
            });

            y += rowHeight;
        });

        doc.end();
        stream.on('finish', () => {
            res.download(filePath, `Invoice-${invoice.reference}.pdf`);
        });
    } catch (error) {
        console.error("Erreur lors de la génération de la facture :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};


exports.downloadInvoice2 = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { 
              model: FlightAgency, 
              as: "vols", 
              include: [{ 
                model: Vol, 
                as: "flight", 
                include: { 
                  model: Company, 
                  as: "companyVol" 
                } 
              }] 
            },
            { model: Passenger, as: "passengers" },
            { 
              model: Agency, 
              as: "agencyReservations",
              include: { 
                model: User, 
                as: 'User' 
              } 
            },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { 
          model: Customer, 
          as: "customer", 
          include: { 
            model: User, 
            as: "user" 
          } 
        },
        { 
          model: Payment, 
          as: "payments", 
          include: { 
            model: paymentMode, 
            as: "paymentMode",
            attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
          } 
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true // Important pour les numéros de page
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // FONCTION POUR FORMALTER LES MONTANTS
    // =========================
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' FCFA';
    };

    // =========================
    // EN-TÊTE
    // =========================
    // Logo (optionnel)
    // const logoPath = path.join(__dirname, "../uploads/logo.png");
    // if (fs.existsSync(logoPath)) {
    //   doc.image(logoPath, 50, 45, { width: 80 });
    // }

    // Titre
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('FACTURE', { align: 'center' })
       .moveDown(0.5);

    // =========================
    // INFORMATIONS AGENCE ET FACTURE (2 COLONNES)
    // =========================
    const agency = invoice.reservation?.agencyReservations;
    const agencyUser = invoice.reservation?.agencyReservations?.User;
    const customer = invoice.customer.user;

    // Colonne gauche - Agence
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('AGENCE', 50, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#1f2937')
       .text(agency?.name || 'Agence non spécifiée', 50, 155)
       .text(agency?.address || 'Adresse non disponible', 50, 170)
       .text(`Tél: ${agency?.phone1 || 'Non disponible'}`, 50, 185)
       .text(`Email: ${agencyUser?.email || 'Non disponible'}`, 50, 200);

    // Colonne droite - Détails facture
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#4b5563')
       .text('DÉTAILS FACTURE', 350, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#1f2937')
       .text(`Référence: ${invoice.reference}`, 350, 155)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 350, 170);

    // Statut avec couleur
    const statusColors = {
      paid: '#10b981',
      partial: '#f59e0b',
      unpaid: '#ef4444',
      overdue: '#b91c1c'
    };
    
    doc.fillColor(statusColors[invoice.status] || '#6b7280')
       .text(`Statut: ${invoice.status === 'paid' ? 'Payée' : 
                       invoice.status === 'partial' ? 'Partiellement payée' : 
                       invoice.status === 'unpaid' ? 'Impayée' : 'En retard'}`, 350, 185)
       .fillColor('#1f2937');

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, 200);
    }

    // =========================
    // MODES DE PAIEMENT DISPONIBLES
    // =========================
    try {
      const paymentModes = await paymentMode.findAll({
        where: { 
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        doc.moveDown(4)
           .fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text('MODES DE PAIEMENT ACCEPTÉS', { underline: true })
           .moveDown(0.3);

        paymentModes.forEach((mode) => {
          const modeIcon = mode.type === 'mobile_money' ? '📱' : 
                          mode.type === 'bank' ? '🏦' : 
                          mode.type === 'cash' ? '💵' : 
                          mode.type === 'cheque' ? '📝' : '💳';
          
          const modeText = `${modeIcon} ${mode.organization || mode.name || mode.type}`;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          const defaultTag = mode.isDefault ? ' (Par défaut)' : '';
          
          doc.font('Helvetica')
             .fontSize(10)
             .fillColor('#374151')
             .text(`• ${modeText}${accountInfo}${defaultTag}`, { indent: 20 });
        });
        
        doc.moveDown();
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }

    // =========================
    // DÉTAILS DE LA RÉSERVATION
    // =========================
    doc.moveDown()
       .fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('DÉTAILS DE LA RÉSERVATION', { underline: true })
       .moveDown(0.5);

    const reservation = invoice.reservation;
    if (reservation) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#374151');

      const companyName = reservation.vols?.flight?.companyVol?.name || 'N/A';
      const flightNumber = reservation.vols?.flight?.flightNumber || '';
      
      doc.text(`Compagnie: ${companyName} ${flightNumber ? `- ${flightNumber}` : ''}`)
         .text(`Départ: ${reservation.startDestination?.city || ''} ${reservation.startDestination?.country ? `(${reservation.startDestination.country})` : ''}`)
         .text(`Arrivée: ${reservation.endDestination?.city || ''} ${reservation.endDestination?.country ? `(${reservation.endDestination.country})` : ''}`);

      if (reservation.vols?.departureTime) {
        const departureDate = new Date(reservation.vols.departureTime);
        const formattedDate = departureDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Date de vol: ${formattedDate}`);
      }
      
      doc.moveDown();
    }

    // =========================
    // TABLEAU DES PASSAGERS
    // =========================
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('DÉTAILS DE LA FACTURE', { underline: true })
       .moveDown(0.5);

    const startX = 50;
    const columnWidths = [230, 150, 150];
    const rowHeight = 25;
    let y = doc.y;

    // En-tête du tableau
    doc.rect(startX, y - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
       .fillAndStroke('#f59e0b', '#f59e0b');
    
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(11);

    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, 
        startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, 
        y, 
        { width: columnWidths[i] - 10, align: i === 0 ? 'left' : 'right' }
      );
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('#1f2937')
       .font('Helvetica')
       .fontSize(10);

    const passengers = reservation?.passengers || [];
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        // Alternance des couleurs de fond
        if (index % 2 === 0) {
          doc.rect(startX, y - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
             .fill('#f9fafb');
        }

        const passengerName = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || 'Nom non spécifié';
        const amount = formatAmount(invoice.amount);

        doc.fillColor('#1f2937');
        
        // Nom du passager
        doc.text(passengerName, startX + 10, y, { width: columnWidths[0] - 20 });
        
        // Montant unitaire
        doc.text(amount, 
          startX + columnWidths[0] + 10, 
          y, 
          { width: columnWidths[1] - 20, align: 'right' }
        );
        
        // Montant total
        doc.text(amount, 
          startX + columnWidths[0] + columnWidths[1] + 10, 
          y, 
          { width: columnWidths[2] - 20, align: 'right' }
        );

        y += rowHeight;
      });
    } else {
      doc.text("Aucun passager enregistré", startX + 10, y);
      y += rowHeight;
    }
        doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold');
    // =========================
    // TOTAUX
    // =========================
    
      const totalX = 350;
    let totalY = y + 10;

    doc.text(`Total HT: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 10;

    doc.text(`Total TTC: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 10;

    doc.text(`Déjà payé: ${(invoice.paid || 0).toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 10;

    doc.fillColor('#D97706');
    doc.text(`Solde restant: ${invoice.balance.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    doc.fillColor('black');
    // =========================
    // DÉTAILS DES PAIEMENTS
    // =========================
    y += 100;

    if (invoice.payments && invoice.payments.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('DÉTAILS DES PAIEMENTS', startX, y, { underline: true })
         .moveDown(0.5);

      y = doc.y;
      
      const paymentColumnWidths = [120, 120, 200];
      
      // En-tête du tableau des paiements
      doc.rect(startX, y - 5, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fillAndStroke('#f59e0b', '#f59e0b');
      
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(11);

      const paymentHeaders = ["Date", "Montant", "Mode de Paiement"];
      paymentHeaders.forEach((header, i) => {
        doc.text(header, 
          startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, 
          y, 
          { width: paymentColumnWidths[i] - 10, align: i === 0 ? 'left' : i === 1 ? 'right' : 'left' }
        );
      });

      // Lignes des paiements
      y += rowHeight;
      doc.fillColor('#1f2937')
         .font('Helvetica')
         .fontSize(10);

      invoice.payments.forEach((payment, index) => {
        if (index % 2 === 0) {
          doc.rect(startX, y - 5, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight)
             .fill('#f9fafb');
        }

        const paymentDate = payment.paymentDate || payment.createdAt;
        const formattedDate = new Date(paymentDate).toLocaleDateString('fr-FR');
        
        const paymentMode = payment.paymentMode;
        let modeDisplay = 'Mode non spécifié';
        
        if (paymentMode) {
          modeDisplay = paymentMode.organization || paymentMode.name || paymentMode.type;
          if (paymentMode.accountNumber) {
            modeDisplay += ` (${paymentMode.accountNumber})`;
          }
        }

        doc.fillColor('#1f2937');
        
        // Date
        doc.text(formattedDate, startX + 10, y, { width: paymentColumnWidths[0] - 20 });
        
        // Montant
        doc.text(formatAmount(payment.amount), 
          startX + paymentColumnWidths[0] + 10, 
          y, 
          { width: paymentColumnWidths[1] - 20, align: 'right' }
        );
        
        // Mode de paiement
        doc.text(modeDisplay, 
          startX + paymentColumnWidths[0] + paymentColumnWidths[1] + 10, 
          y, 
          { width: paymentColumnWidths[2] - 20 }
        );

        y += rowHeight;
      });
    } else {
      // Message si aucun paiement
      doc.roundedRect(80, y, doc.page.width - 160, 80, 10)
         .fillAndStroke('#fef3c7', '#f59e0b');
      
      doc.fillColor('#92400e')
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('⚠️ AUCUN PAIEMENT EFFECTUÉ', 100, y + 15, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('Pour finaliser votre réservation, veuillez contacter l\'agence :', 100, y + 40, { align: 'center', width: doc.page.width - 200 });
      
      const contactY = y + 60;
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text(` ${agency?.phone1 || agency?.phone2 || 'Non disponible'}`, 100, contactY, { align: 'center', width: doc.page.width - 200 })
         .text(` ${agencyUser?.email || 'Non disponible'}`, 100, contactY + 15, { align: 'center', width: doc.page.width - 200 });
    }

    // =========================
    // PIED DE PAGE
    // =========================
    const bottomY = doc.page.height - 80;
    
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Nous apprécions votre clientèle.', 50, bottomY, { align: 'center', width: doc.page.width - 100 })
       .text('Pour toute question, contactez notre service client.', 50, bottomY + 15, { align: 'center', width: doc.page.width - 100 });

    // Numéros de page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Page ${i + 1} sur ${pages.count}`,
           50,
           doc.page.height - 50,
           { align: 'center', width: doc.page.width - 100 }
         );
    }

    // Finaliser le document
    doc.end();

    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

    stream.on('error', (error) => {
      console.error("Erreur stream:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF" });
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

exports.downloadInvoice1 = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations", include: { model: User, as: 'User' } },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        { 
          model: Payment, 
          as: "payments", 
          include: { 
            model: paymentMode, 
            as: "paymentMode",
            attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
          } 
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // EN-TÊTE AVEC LOGO, AGENCE À GAUCHE ET DÉTAILS FACTURE À DROITE
    // =========================
    let yPosition = 50;

    // Logo à gauche
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, yPosition, { width: 60, height: 60 });
    }

    // Titre principal centré
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24)
       .text("FACTURE", 50, yPosition, { align: "center", width: doc.page.width - 100 });

    // =========================
    // INFORMATIONS AGENCE (COLONNE GAUCHE)
    // =========================
    yPosition += 40;
    const agency = invoice.reservation?.agencyReservations;
    const agencyEmail = invoice.reservation?.agencyReservations?.User;

     // Colonne gauche - Agence
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('AGENCE', 50, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#1f2937')
       .text(agency?.name || 'Agence non spécifiée', 50, 155)
       .text(agency?.address || 'Adresse non disponible', 50, 170)
       .text(`Tél: ${agency?.phone1 || 'Non disponible'}`, 50, 185)
       .text(`Email: ${agencyUser?.email || 'Non disponible'}`, 50, 200);

    // Colonne droite - Détails facture
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#4b5563')
       .text('DÉTAILS FACTURE', 350, 140);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#1f2937')
       .text(`Référence: ${invoice.reference}`, 350, 155)
       .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 350, 170);

    // Statut avec couleur
    const statusColors = {
      paid: '#10b981',
      partial: '#f59e0b',
      unpaid: '#ef4444',
      overdue: '#b91c1c'
    };

    doc.fillColor(statusColors[invoice.status] || '#6b7280')
       .text(`Statut: ${invoice.status === 'paid' ? 'Payée' :
                       invoice.status === 'partial' ? 'Partiellement payée' :
                       invoice.status === 'unpaid' ? 'Impayée' : 'En retard'}`, 350, 185)
       .fillColor('#1f2937');

    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, 200);
    }


    // =========================
    // MODES DE PAIEMENT DISPONIBLES
    // =========================
    yPosition += 90;
    
    // Récupérer les modes de paiement de l'agence (à adapter selon votre logique)
     try {
      const paymentModes = await paymentMode.findAll({
        where: {
          agencyId: agency?.id,
          status: 'active'
        }
      });

      if (paymentModes && paymentModes.length > 0) {
        doc.moveDown(4)
           .fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text('MODES DE PAIEMENT ACCEPTÉS', { underline: true })
           .moveDown(0.3);

        paymentModes.forEach((mode) => {
          const modeIcon = mode.type === 'mobile_money' ? '📱' :
                          mode.type === 'bank' ? '🏦' :
                          mode.type === 'cash' ? '💵' :
                          mode.type === 'cheque' ? '📝' : '💳';

          const modeText = `${modeIcon} ${mode.organization || mode.name || mode.type}`;
          const accountInfo = mode.accountNumber ? ` - ${mode.accountNumber}` : '';
          const defaultTag = mode.isDefault ? ' (Par défaut)' : '';

          doc.font('Helvetica')
             .fontSize(10)
             .fillColor('#374151')
             .text(`• ${modeText}${accountInfo}${defaultTag}`, { indent: 20 });
        });

        doc.moveDown();
      }
    } catch (error) {
      console.error("Erreur chargement modes paiement:", error);
    }


    // =========================
    // DÉTAILS DE LA RÉSERVATION
    // =========================
    doc.moveDown()
       .fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('DÉTAILS DE LA RÉSERVATION', { underline: true })
       .moveDown(0.5);

    const reservation = invoice.reservation;
    if (reservation) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#374151');

      const companyName = reservation.vols?.flight?.companyVol?.name || 'N/A';
      const flightNumber = reservation.vols?.flight?.flightNumber || '';

      doc.text(`Compagnie: ${companyName} ${flightNumber ? `- ${flightNumber}` : ''}`)
         .text(`Départ: ${reservation.startDestination?.city || ''} ${reservation.startDestination?.country ? `(${reservation.startDestination.country})` : ''}`)
         .text(`Arrivée: ${reservation.endDestination?.city || ''} ${reservation.endDestination?.country ? `(${reservation.endDestination.country})` : ''}`);

      if (reservation.vols?.departureTime) {
        const departureDate = new Date(reservation.vols.departureTime);
        const formattedDate = departureDate.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(`Date de vol: ${formattedDate}`);
      }

      doc.moveDown();
    }


    // =========================
    // TABLEAU DES PASSAGERS AVEC HEADERS ORANGE
    // =========================
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA FACTURE", { underline: true }).moveDown(0.5);

    const startX = 50;
    const columnWidths = [200, 150, 150];
    const rowHeight = 25;
    let y = doc.y;

    // En-tête du tableau avec fond orange
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
        width: columnWidths[i],
        align: i === 0 ? 'left' : 'right'
      });
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('black').font('Helvetica').fontSize(12);

    const passengers = reservation?.passengers || [];
    if (passengers.length > 0) {
      passengers.forEach((passenger, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        const row = [
          `${passenger.firstName || ''} ${passenger.lastName || ''}`,
          `${invoice.amount.toFixed(2)} Fcfa`,
          `${invoice.amount.toFixed(2)} Fcfa`
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: columnWidths[i],
            align: i === 0 ? 'left' : 'right'
          });
        });

        y += rowHeight;
      });
    } else {
      doc.text("Aucun passager enregistré", startX + 10, y + 7);
      y += rowHeight;
    }

    // =========================
    // TOTAUX
    // =========================
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold');

    // Positionner les totaux à droite
    const totalX = 350;
    let totalY = y + 20;

    doc.text(`Total HT: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;

    doc.text(`Total TTC: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;

    doc.text(`Déjà payé: ${(invoice.paid || 0).toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;

    doc.fillColor('#D97706');
    doc.text(`Solde restant: ${invoice.balance.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    doc.fillColor('black');

    // =========================
    // DÉTAILS DES PAIEMENTS
    // =========================
    doc.moveDown(2);
    
    if (invoice.payments && invoice.payments.length > 0) {
      doc.fontSize(14).fillColor('black').text("DÉTAILS DES PAIEMENTS", { underline: true }).moveDown(0.5);

      const paymentsTableHeaders = ["Date", "Montant", "Mode de Paiement", "Référence"];
      const paymentColumnWidths = [100, 100, 150, 150];
      y = doc.y;

      // En-tête du tableau des paiements avec fond orange
      doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12);

      paymentsTableHeaders.forEach((header, i) => {
        doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
          width: paymentColumnWidths[i],
          align: i === 0 ? 'left' : 'center'
        });
      });

      // Lignes des paiements
      y += rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(10);

      invoice.payments.forEach((payment, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        // Récupérer les informations du mode de paiement
        const paymentMode = payment.paymentMode;
        const modeDisplay = paymentMode 
          ? `${paymentMode.organization || paymentMode.name || paymentMode.type} ${paymentMode.accountNumber ? `(${paymentMode.accountNumber})` : ''}`
          : 'Mode non spécifié';

        const row = [
          new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('fr-FR'),
          `${payment.amount.toFixed(2)} Fcfa`,
          modeDisplay,
          payment.reference || 'N/A'
        ];

        row.forEach((text, i) => {
          doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, {
            width: paymentColumnWidths[i],
            align: i === 0 ? 'left' : i === 1 ? 'right' : 'center'
          });
        });

        y += rowHeight;
      });
      
      doc.moveDown();
    } else {
      // =========================
      // MESSAGE SI AUCUN PAIEMENT
      // =========================
      doc.moveDown(2);
      
      // Encadré orange pour attirer l'attention
      doc.rect(80, doc.y, doc.page.width - 160, 80).fillAndStroke('#fef3c7', '#D97706');
      doc.fillColor('#92400e').fontSize(14).font('Helvetica-Bold');
      
      const messageY = doc.y + 15;
      doc.text("⚠️ AUCUN PAIEMENT EFFECTUÉ", 100, messageY, { align: 'center', width: doc.page.width - 200 });
      
      doc.fontSize(12).font('Helvetica');
      doc.text("Pour finaliser votre réservation, veuillez contacter l'agence :", 100, messageY + 25, { align: 'center', width: doc.page.width - 200 });
      
      const contactY = messageY + 45;
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(`📞 Tél: ${agency?.phone1 || agency?.phone2 || 'N/A'}`, 100, contactY, { align: 'center', width: doc.page.width - 200 });
      doc.text(`✉️ Email: ${agencyEmail?.email || 'N/A'}`, 100, contactY + 15, { align: 'center', width: doc.page.width - 200 });
      
      doc.fillColor('black');
      doc.moveDown(5);
    }

    // =========================
    // PIED DE PAGE
    // =========================
    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text("Nous apprécions votre clientèle.", { align: 'center' });
    doc.text("Si vous avez des questions sur cette facture, n'hésitez pas à nous contacter.", { align: 'center' });

    // Numéro de page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('gray').text(
        `Page ${i + 1} sur ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );
    }

    doc.end();
    
    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};
    exports.downloadInvoiceBonCode = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            { model: FlightAgency, as: "vols", include: [{ model: Vol, as: "flight", include: { model: Company, as: "companyVol" } }] },
            { model: Passenger, as: "passengers" },
            { model: Agency, as: "agencyReservations",include:{model:User,as:'User'} },
            { model: Destination, as: "startDestination" },
            { model: Destination, as: "endDestination" }
          ],
        },
        { model: Customer, as: "customer", include: { model: User, as: "user" } },
        { model: Payment, as: "payments", include: { model: paymentMode, as: "paymentMode" } },
      ],
    });

    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable" });
    }

    const invoicesDir = path.join(__dirname, "../secure_invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // =========================
    // EN-TÊTE AVEC LOGO, AGENCE À GAUCHE ET DÉTAILS FACTURE À DROITE
    // =========================
    let yPosition = 50;

    // Logo à gauche
    const logoPath = path.join(__dirname, "../uploads/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, yPosition, { width: 60, height: 60 });
    }

    // Titre principal centré
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24)
       .text("FACTURE", 50, yPosition, { align: "center", width: doc.page.width - 100 });

    // =========================
    // INFORMATIONS AGENCE (COLONNE GAUCHE)
    // =========================
    yPosition += 40;
    const agency = invoice.reservation?.agencyReservations;
    const agencyEmail = invoice.reservation?.agencyReservations.User;
    
    doc.font("Helvetica-Bold").fontSize(12).text("AGENCE:", 50, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(agency?.name || "Agence Voyage", 50, yPosition + 15);
    doc.text(agency?.address || "Adresse inconnue", 50, yPosition + 30);
    doc.text(`Tél: ${agency?.phone1 || "N/A"}`, 50, yPosition + 45);
    doc.text(`Email: ${agencyEmail?.email || "N/A"}`, 50, yPosition + 60);

    // =========================
    // INFORMATIONS FACTURE (COLONNE DROITE)
    // =========================
    const customer = invoice.customer || invoice.customer.user;
    
    doc.font("Helvetica-Bold").fontSize(12).text("DÉTAILS FACTURE:", 350, yPosition);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Référence: ${invoice.reference}`, 350, yPosition + 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("fr-FR")}`, 350, yPosition + 30);
    doc.text(`Statut: ${invoice.status.toUpperCase()}`, 350, yPosition + 45);
    
    if (customer) {
      doc.text(`Client: ${customer.firstName || ''} ${customer.lastName || ''}`, 350, yPosition + 60);
    }

    // =========================
    // DÉTAILS DE LA RÉSERVATION
    // =========================
    yPosition += 90;
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA RÉSERVATION", { underline: true }).moveDown(0.5);
    
    const reservation = invoice.reservation;
    if (reservation) {
      doc.fontSize(12);
      doc.text(`Vol: ${reservation.vols?.flight?.companyVol?.name || 'N/A'} - ${reservation.vols?.flight?.flightNumber || 'N/A'}`);
      doc.text(`Départ: ${reservation.startDestination?.country || 'N/A'}`);
      doc.text(`Arrivée: ${reservation.endDestination?.country || 'N/A'}`);
      
      const departureTime = reservation.vols?.departureTime;
      const formattedDateTime = departureTime
        ? new Date(departureTime).toLocaleString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          })
        : "N/A";
      
      doc.text(`Date de vol: ${formattedDateTime}`).moveDown();
    }

    // =========================
    // TABLEAU DES PASSAGERS AVEC HEADERS ORANGE
    // =========================
    doc.fontSize(14).fillColor('black').text("DÉTAILS DE LA FACTURE", { underline: true }).moveDown(0.5);

    const startX = 50;
    const columnWidths = [200, 150, 150];
    const rowHeight = 25;
    let y = doc.y;

    // En-tête du tableau avec fond orange
    doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
    
    const headers = ["Nom du Passager", "Montant Unitaire", "Montant Total"];
    headers.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { 
        width: columnWidths[i], 
        align: 'center' 
      });
    });

    // Lignes des passagers
    y += rowHeight;
    doc.fillColor('black').font('Helvetica').fontSize(12);
    
    invoice.reservation.passengers.forEach((passenger, index) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
      doc.rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
      doc.fillColor('black');

      const row = [
        `${passenger.firstName} ${passenger.lastName}`,
        `${invoice.amount.toFixed(2)} Fcfa`,
        `${invoice.amount.toFixed(2)} Fcfa`
      ];
      
      row.forEach((text, i) => {
        doc.text(text, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { 
          width: columnWidths[i], 
          align: i > 0 ? 'right' : 'left' 
        });
      });

      y += rowHeight;
    });

    // =========================
    // TOTAUX SIMPLIFIÉS (NET À PAYER)
    // =========================
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold');
    
    // Positionner les totaux à droite
    const totalX = 375;
    let totalY = doc.y;
    
    doc.text(`Total Montant: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;
    
    doc.text(`Reliquat: ${invoice.balance.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    totalY += 20;
    
    doc.text(`Net à Payer: ${invoice.amount.toFixed(2)} Fcfa`, totalX, totalY, { align: 'right' });
    
    doc.moveDown();

    // =========================
    // DÉTAILS DES PAIEMENTS AVEC HEADERS ORANGE
    // =========================
    if (invoice.payments && invoice.payments.length > 0) {
      doc.fontSize(14).fillColor('black').text("DÉTAILS DES PAIEMENTS", { underline: true }).moveDown(0.5);

      const paymentsTableHeaders = ["Montant Payé", "Date de Paiement", "Référence Pay"];
      const paymentColumnWidths = [150, 150, 200];
      y = doc.y;

      // En-tête du tableau des paiements avec fond orange
      doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#D97706');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
      
      paymentsTableHeaders.forEach((header, i) => {
        doc.text(header, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { 
          width: paymentColumnWidths[i], 
          align: 'center' 
        });
      });

      // Lignes des paiements
      y += rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(12);
      
      invoice.payments.forEach((payment, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : 'white';
        doc.rect(startX, y, paymentColumnWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);
        doc.fillColor('black');

        const row = [
          `${payment.amount.toFixed(2)} Fcfa`,
          new Date(payment.paymentDate).toLocaleDateString('fr-FR'),
          payment.reference || 'N/A'
        ];
        
        row.forEach((text, i) => {
          doc.text(text, startX + paymentColumnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10, y + 7, { 
            width: paymentColumnWidths[i], 
            align: i === 0 ? 'right' : 'center' 
          });
        });

        y += rowHeight;
      });
    }

    // =========================
    // PIED DE PAGE
    // =========================
    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text("Nous apprécions votre clientèle.", { align: 'center' });
    doc.text("Si vous avez des questions sur cette facture, n'hésitez pas à nous contacter.", { align: 'center' });

    doc.end();
    stream.on('finish', () => {
      res.download(filePath, `Invoice-${invoice.reference}.pdf`);
    });

  } catch (error) {
    console.error("Erreur génération facture:", error);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};
// exports.downloadInvoice = async (req, res) => {

//     try {
//         console.log('customerId', req.params.id);

//         const invoice = await Invoice.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Reservation,
//                     as: 'reservation',
//                     include: [
//                         { model: Vol, as: 'vol', include: { model: Company, as: 'companyVol' } },
//                         { model: Passenger, as: 'passengers' },
//                         { model: Agency, as: 'agencyReservations' },
//                         { model: Destination, as: 'startDestination' },
//                         { model: Destination, as: 'endDestination' }
//                     ],
                  
//                 },{
//                      model:Customer,as:'customer',include:{model:User,as:'user'}

//                 } ,{model:Payment,as:'payments'} 
//             ]
//         });

//         if (!invoice) {
//             return res.status(404).json({ message: 'Invoice not found' });
//         }

//         const invoicesDir = path.join(__dirname, '../secure_invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         const filePath = path.join(invoicesDir, `Invoice-${invoice.reference}.pdf`);
//         const doc = new PDFDocument({ margin: 50 });
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         const agency = invoice.reservation?.agencyReservations;
//         const logoPath = agency && agency.logo ? path.join(__dirname, '../uploads', agency.logo) : null;

//         if (logoPath && fs.existsSync(logoPath)) {
//             doc.image(logoPath, 50, 30, { width: 100 }).moveDown(2);
//         }

//         doc.fontSize(20).font('Helvetica-Bold').text(`FACTURE PROFORMA`, { align: 'center' }).moveDown();
//         doc.fontSize(12).text(`Référence: ${invoice.reference}`, { align: 'right' });
//         doc.text(`Date d'émission: ${new Date(invoice.emissionAt).toLocaleDateString()}`, { align: 'right' });
//         doc.text(`Statut: ${invoice.status.toUpperCase()}`, { align: 'right' }).moveDown();
//    console.log('destinatination',invoice.reservation.endDestination)
//         if (agency) {
//             doc.fontSize(14).font('Helvetica-Bold').text(`Informations de l'Agence`, { underline: true }).moveDown(0.5);
//             doc.fontSize(12).font('Helvetica').text(`Nom: ${agency.name}`);
//             doc.text(`Adresse: ${agency.address || 'N/A'}`);
//             doc.text(`Téléphone: ${agency.phone || 'N/A'}`).moveDown();
//         }

//         if (invoice.customer) {
//             doc.fontSize(14).font('Helvetica-Bold').text(`Informations du Client`, { underline: true }).moveDown(0.5);
//             doc.fontSize(12).font('Helvetica').text(`Nom: ${invoice.customer.user.name}`);
//             doc.text(`Email: ${invoice.customer.user.email}`).moveDown();
//         }

//         doc.fontSize(14).font('Helvetica-Bold').text(`Détails de la Réservation`, { underline: true }).moveDown(0.5);
        // if (invoice.reservation) {
        //     doc.fontSize(12).font('Helvetica').text(`Vol: ${invoice.reservation.vol?.name || 'N/A'}`);
        //     doc.fontSize(12).font('Helvetica').text(`Destination: ${invoice.reservation.endDestination?.country || 'N/A'}`);
        //     doc.fontSize(12).font('Helvetica').text(`Type de vol: ${invoice.reservation.tripType || 'N/A'}`);
            
        //     doc.text(`Passager(s):`);
        //     invoice.reservation.passengers.forEach((passenger, index) => {
        //         doc.text(`  ${index + 1}. ${passenger.firstName} ${passenger.lastName}`);
        //     });
        //     doc.moveDown();
        // }

//         doc.fontSize(14).font('Helvetica-Bold').text(`Détails Financiers`, { underline: true }).moveDown(0.5);
//         doc.fontSize(12).font('Helvetica').text(`Montant HT: ${invoice.amount.toFixed(2)} Fcfa`);
//         doc.text(`TVA (${invoice.tva}%): ${(invoice.amount * (invoice.tva / 100)).toFixed(2)} Fcfa`);
//         doc.text(`Total TTC: ${invoice.totalWithTax.toFixed(2)} Fcfa`);
//         doc.text(`Balance restante: ${invoice.balance.toFixed(2)} Fcfa`).moveDown();
         
//       doc.fontSize(14).font('Helvetica-Bold').text(`Paiements effectués`, { underline: true }).moveDown(0.5);

// if (invoice.payments.length > 0) {
//     invoice.payments.forEach((payment, index) => {
//         doc.fontSize(12).font('Helvetica').text(
//             `${index + 1}. Mode: ${payment.modePaymentId} | Montant: ${payment.amount.toFixed(2)} Fcfa | Réf: ${payment.reference} | Date: ${new Date(payment.paymentDate).toLocaleDateString()}`
//         );
//     });
// } else {
//     doc.fontSize(12).font('Helvetica').text(`Aucun paiement enregistré.`);
// }
// doc.moveDown();


//         doc.fontSize(12).font('Helvetica-Oblique').text(`Cette facture est un document proforma et ne constitue pas une preuve de paiement.`, { align: 'center' }).moveDown();

//         const signature = crypto.createHmac('sha256', process.env.PRIVATE_KEY || 'default_secret')
//             .update(invoice.reference + invoice.amount)
//             .digest('hex');
//         doc.text(`Signature électronique: ${signature}`).moveDown();

//         doc.end();

//         stream.on('finish', async () => {
//             console.log("Facture générée avec succès :", filePath);
//           console.log(invoice.customer.user?.email)
//           if (!fs.existsSync(filePath)) {
//     console.error("Fichier PDF introuvable !");
//     return res.status(500).json({ message: "Facture non trouvée pour l'email." });
// }

//             if (invoice.customer && invoice.customer.user?.email) {
//                 const emailSubject = 'Votre facture de réservation';
//                 const emailBody = `
//                     <p>Bonjour,</p>
//                     <p>Veuillez trouver ci-joint votre facture pour la réservation.</p>
//                     <p>Référence de la facture: <strong>${invoice.reference}</strong></p>
//                     <p>Merci pour votre confiance.</p>
//                 `;

//                 try {
//                     await NotificationService.sendEmail(
//                         invoice.customer.user.email,
//                         emailSubject,
//                         emailBody,
//                         {
//         html: true,
//         attachments: [
//             { 
//                 filename: `Invoice-${invoice.reference}.pdf`, 
//                 path: filePath, 
//                 contentType: 'application/pdf' 
//             }
//         ]
//     }
//                     );
//                     console.log(`Facture envoyée avec succès à ${invoice.customer.user.email}`);
//                 } catch (error) {
//                     console.error("Erreur lors de l'envoi de l'email :", error);
//                 }
//             }

//             res.download(filePath, `Invoice-${invoice.reference}.pdf`, (err) => {
//                 if (err) {
//                     console.error("Erreur lors du téléchargement du fichier :", err);
//                     res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
//                 }
//             });
//         });

//     } catch (error) {
//         console.error("Erreur lors de la génération de la facture :", error);
//         res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
// };
