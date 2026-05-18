//const { Payment, Invoice, PaymentMode } = require('../models');
const Payment =require('../models/payment')
const PaymentMode=require('../models/paymentMode')
const Invoice=require('../models/invoice')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Agency=require('../models/agenceModel')
const Customer=require('../models/customer')
const NotificationService=require('../services/notification.service')
const User=require('../models/userModel')
const { Op } = require('sequelize');
const sequelize=require('../config/bd');

exports.createPayment = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { invoiceId, paymentModeId, amount, reference, description, paymentDate } = req.body;

        // Validation des champs requis
        if (!invoiceId || !paymentModeId || !amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "L'ID de la facture, le mode de paiement et un montant valide sont requis" 
            });
        }

        // Récupérer la facture avec ses relations
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                { 
                    model: Agency, 
                    as: "agencyInvoice",
                    include: { 
                        model: User, 
                        as: "User" 
                    } 
                },
                { 
                    model: Customer, 
                    as: "customer",
                    include: { 
                        model: User, 
                        as: "user" 
                    } 
                }
            ],
            transaction: t
        });

        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Facture introuvable" 
            });
        }

        // Vérifier que le montant du paiement ne dépasse pas le solde
        if (amount > invoice.balance) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Le montant du paiement (${amount.toFixed(2)} XOF) dépasse le solde restant de ${invoice.balance.toFixed(2)} XOF`,
            });
        }

        // Vérifier le mode de paiement
        const paymentMode = await PaymentMode.findByPk(paymentModeId, { transaction: t });
        if (!paymentMode) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Mode de paiement introuvable" 
            });
        }

        if (paymentMode.status !== "active") {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Ce mode de paiement n'est pas actif" 
            });
        }

        // Vérifier que le mode appartient à la même agence que la facture
        if (paymentMode.agencyId !== invoice.agencyId) {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Ce mode de paiement n'appartient pas à l'agence de cette facture" 
            });
        }

        // Générer une référence unique si elle n'est pas fournie
        const generatePaymentReference = () => {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `PAY-${timestamp}-${random}`;
        };

        const paymentReference = reference && reference.trim() !== "" 
            ? reference.trim() 
            : generatePaymentReference();

        // Vérifier l'unicité de la référence
        const existingPayment = await Payment.findOne({
            where: { reference: paymentReference },
            transaction: t
        });

        if (existingPayment) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Cette référence de paiement existe déjà"
            });
        }

        // Créer le paiement
        const payment = await Payment.create({
            invoiceId,
            modePaymentId: paymentModeId,
            amount,
            reference: paymentReference,
            paymentDate: paymentDate || new Date(),
            description: description || `Paiement facture ${invoice.reference}`,
            status: "completed",
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        }, { transaction: t });

        // Déduire le montant du solde de la facture
        invoice.balance = parseFloat(invoice.balance) - parseFloat(amount);
        invoice.paid = (parseFloat(invoice.paid) || 0) + parseFloat(amount);

        // Vérifier si la facture est totalement payée
        invoice.status = invoice.balance <= 0 ? "paid" : "partial";
        await invoice.save({ transaction: t });

        // COMMIT de la transaction avant l'envoi des emails
        await t.commit();
        console.log('✅ Transaction commitée avec succès');

        // ===========================================
        // ENVOI DES EMAILS (HORS TRANSACTION)
        // ===========================================
        // Récupérer les emails des utilisateurs concernés
        const agencyUserEmail = invoice.agencyInvoice?.User?.email;
        const customerEmail = invoice.customer?.user?.email;
        const customerFirstName = invoice.customer?.firstName || "";
        const customerLastName = invoice.customer?.lastName || "";

        // Envoi d'email à l'agence (en arrière-plan, ne pas bloquer la réponse)
        if (agencyUserEmail) {
            sendEmailToAgency(agencyUserEmail, invoice, payment, amount, paymentReference, paymentMode, customerFirstName, customerLastName)
                .catch(err => console.error("Erreur envoi email agence:", err));
        }

        // Envoi d'email au client (en arrière-plan, ne pas bloquer la réponse)
        if (customerEmail) {
            sendEmailToCustomer(customerEmail, invoice, payment, amount, paymentReference, paymentMode, customerFirstName, customerLastName)
                .catch(err => console.error("Erreur envoi email client:", err));
        }

        // Récupérer le paiement avec ses relations pour la réponse
        const completedPayment = await Payment.findByPk(payment.id, {
            include: [
                { 
                    model: PaymentMode, 
                    as: "paymentMode",
                    attributes: ['id', 'name', 'type', 'organization', 'accountNumber', 'status']
                },
                {
                    model: Invoice,
                    as: "invoicePayment",
                    attributes: ['id', 'reference', 'amount',  'balance', 'status']
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Paiement effectué avec succès",
            data: {
                payment: completedPayment,
                invoice: {
                    id:invoice.id,
                    reference: invoice.reference,
                    total: invoice.amount,
                    
                    balance: invoice.balance,
                    status: invoice.status
                }
            }
        });

    } catch (error) {
        // Rollback uniquement si la transaction n'est pas déjà commitée
        try {
            await t.rollback();
            console.log('↩️ Transaction annulée');
        } catch (rollbackError) {
            console.error('❌ Erreur lors du rollback:', rollbackError.message);
        }
        
        console.error("❌ Erreur lors du traitement du paiement:", error);
        return res.status(500).json({ 
            success: false,
            message: "Erreur interne du serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Fonction séparée pour l'envoi d'email à l'agence
async function sendEmailToAgency(email, invoice, payment, amount, paymentReference, paymentMode, customerFirstName, customerLastName) {
    try {
        const emailSubjectAgency = "✅ Paiement reçu - Nouveau paiement enregistré";
        const emailBodyAgency = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Paiement reçu</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Client :</strong> ${customerFirstName} ${customerLastName}</p>
                    <p><strong>Facture :</strong> #${invoice.reference}</p>
                    <p><strong>Montant initial :</strong> ${(invoice.paid + invoice.balance).toFixed(2)} XOF</p>
                    <p><strong>Montant payé :</strong> ${amount.toFixed(2)} XOF</p>
                    <p><strong>Solde restant :</strong> ${invoice.balance.toFixed(2)} XOF</p>
                    <p><strong>Référence paiement :</strong> ${paymentReference}</p>
                    <p><strong>Mode de paiement :</strong> ${paymentMode.organization || paymentMode.type}</p>
                    <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                
                <p style="color: #27ae60; font-weight: bold;">Statut de la facture : ${invoice.status === 'paid' ? 'Payée' : 'Partiellement payée'}</p>
                
                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                
                <p style="color: #7f8c8d; font-size: 12px;">
                    Ceci est un message automatique, merci de ne pas y répondre.
                </p>
            </div>
        `;

        await NotificationService.sendEmail(email, emailSubjectAgency, emailBodyAgency);
        console.log(`📧 Email envoyé à l'agence: ${email}`);
    } catch (error) {
        console.error("❌ Erreur envoi email à l'agence:", error);
        // Ne pas relancer l'erreur pour ne pas bloquer
    }
}

// Fonction séparée pour l'envoi d'email au client
async function sendEmailToCustomer(email, invoice, payment, amount, paymentReference, paymentMode, customerFirstName, customerLastName) {
    try {
        const emailSubjectCustomer = "✅ Confirmation de paiement - Voyage";
        const emailBodyCustomer = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Confirmation de paiement</h2>
                
                <p>Cher(e) ${customerFirstName} ${customerLastName},</p>
                
                <p>Votre paiement a été validé avec succès.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Facture :</strong> #${invoice.reference}</p>
                    <p><strong>Montant payé :</strong> ${amount.toFixed(2)} XOF</p>
                    <p><strong>Référence paiement :</strong> ${paymentReference}</p>
                    <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                    <p><strong>Mode de paiement :</strong> ${paymentMode.organization || paymentMode.type}</p>
                </div>
                
                <p>Merci pour votre confiance et à bientôt pour votre prochain voyage !</p>
                
                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                
                <p style="color: #7f8c8d; font-size: 12px;">
                    Ceci est un message automatique, merci de ne pas y répondre.
                </p>
            </div>
        `;

        await NotificationService.sendEmail(email, emailSubjectCustomer, emailBodyCustomer);
        console.log(`📧 Email envoyé au client: ${email}`);
    } catch (error) {
        console.error("❌ Erreur envoi email au client:", error);
        // Ne pas relancer l'erreur pour ne pas bloquer
    }
}
exports.getPaymentsByInvoice = async (req, res) => {
    try {
        const invoiceId  = req.params.id;
         if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID manquant"
      });
    }
        const payments = await Payment.findAll({
            where: { invoiceId:Number(invoiceId)  },
            include: [
                {
                    model: PaymentMode,
                    as: "paymentMode",
                    attributes: ['id', 'name', 'type', 'organization', 'accountNumber']
                },
                {
                    model: Invoice,
                    as: "invoicePayment",  // CORRECTION: Utiliser le bon alias
                    attributes: ['id', 'reference', 'amount', 'balance', 'status']
                }
            ],
            order: [['paymentDate', 'DESC'], ['createdAt', 'DESC']]
        });

        return res.json({
            success: true,
            data: payments,
            count: payments.length
        });

    } catch (error) {
        console.error("❌ Erreur récupération paiements:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des paiements"
        });
    }
};

exports.createPaymentTest2 = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { invoiceId, paymentModeId, amount, reference, description, paymentDate } = req.body;

        // Validation des champs requis
        if (!invoiceId || !paymentModeId || !amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ 
                message: "L'ID de la facture, le mode de paiement et un montant valide sont requis" 
            });
        }

        // Récupérer la facture avec ses relations
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                { 
                    model: Agency, 
                    as: "agencyInvoice",
                    include: { 
                        model: User, 
                        as: "User" 
                    } 
                },
                { 
                    model: Customer, 
                    as: "customer",
                    include: { 
                        model: User, 
                        as: "user" 
                    } 
                }
            ],
            transaction: t
        });

        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Facture introuvable" 
            });
        }

        // Vérifier que le montant du paiement ne dépasse pas le solde
        if (amount > invoice.balance) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Le montant du paiement (${amount.toFixed(2)} XOF) dépasse le solde restant de ${invoice.balance.toFixed(2)} XOF`,
            });
        }

        // Vérifier le mode de paiement
        const paymentMode = await PaymentMode.findByPk(paymentModeId, { transaction: t });
        if (!paymentMode) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Mode de paiement introuvable" 
            });
        }

        if (paymentMode.status !== "active") {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Ce mode de paiement n'est pas actif" 
            });
        }

        // Vérifier que le mode appartient à la même agence que la facture
        if (paymentMode.agencyId !== invoice.agencyId) {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Ce mode de paiement n'appartient pas à l'agence de cette facture" 
            });
        }

        // Générer une référence unique si elle n'est pas fournie
        const generatePaymentReference = () => {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `PAY-${timestamp}-${random}`;
        };

        const paymentReference = reference && reference.trim() !== "" 
            ? reference.trim() 
            : generatePaymentReference();

        // Vérifier l'unicité de la référence
        const existingPayment = await Payment.findOne({
            where: { reference: paymentReference },
            transaction: t
        });

        if (existingPayment) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Cette référence de paiement existe déjà"
            });
        }

        // Créer le paiement
        const payment = await Payment.create({
            invoiceId,
            modePaymentId: paymentModeId,
            amount,
            reference: paymentReference,
            paymentDate: paymentDate || new Date(),
            description: description || `Paiement facture ${invoice.reference}`,
            status: "completed",
            createdBy: req.user?.id || null,
            updatedBy: req.user?.id || null
        }, { transaction: t });

        // Déduire le montant du solde de la facture
        invoice.balance = parseFloat(invoice.balance) - parseFloat(amount);
        invoice.paid = (parseFloat(invoice.paid) || 0) + parseFloat(amount);

        // Vérifier si la facture est totalement payée
        invoice.status = invoice.balance <= 0 ? "paid" : "partial";
        await invoice.save({ transaction: t });

        // Récupérer les emails des utilisateurs concernés
        const agencyUserEmail = invoice.agencyInvoice?.User?.email;
        const customerEmail = invoice.customer?.user?.email;
        const customerFirstName = invoice.customer?.firstName || "";
        const customerLastName = invoice.customer?.lastName || "";

        // Envoi d'email à l'agence
        if (agencyUserEmail) {
            try {
                const emailSubjectAgency = "✅ Paiement reçu - Nouveau paiement enregistré";
                const emailBodyAgency = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Paiement reçu</h2>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Client :</strong> ${customerFirstName} ${customerLastName}</p>
                            <p><strong>Facture :</strong> #${invoice.reference}</p>
                            <p><strong>Montant initial :</strong> ${(invoice.paid + invoice.balance).toFixed(2)} XOF</p>
                            <p><strong>Montant payé :</strong> ${amount.toFixed(2)} XOF</p>
                            <p><strong>Solde restant :</strong> ${invoice.balance.toFixed(2)} XOF</p>
                            <p><strong>Référence paiement :</strong> ${paymentReference}</p>
                            <p><strong>Mode de paiement :</strong> ${paymentMode.organization || paymentMode.type}</p>
                            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        
                        <p style="color: #27ae60; font-weight: bold;">Statut de la facture : ${invoice.status === 'paid' ? 'Payée' : 'Partiellement payée'}</p>
                        
                        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                        
                        <p style="color: #7f8c8d; font-size: 12px;">
                            Ceci est un message automatique, merci de ne pas y répondre.
                        </p>
                    </div>
                `;

                await NotificationService.sendEmail(agencyUserEmail, emailSubjectAgency, emailBodyAgency);
                console.log(`📧 Email envoyé à l'agence: ${agencyUserEmail}`);
            } catch (emailError) {
                console.error("Erreur envoi email à l'agence:", emailError);
            }
        }

        // Envoi d'email au client
        if (customerEmail) {
            try {
                const emailSubjectCustomer = "✅ Confirmation de paiement - Voyage";
                const emailBodyCustomer = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Confirmation de paiement</h2>
                        
                        <p>Cher(e) ${customerFirstName} ${customerLastName},</p>
                        
                        <p>Votre paiement a été validé avec succès.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Facture :</strong> #${invoice.reference}</p>
                            <p><strong>Montant payé :</strong> ${amount.toFixed(2)} XOF</p>
                            <p><strong>Référence paiement :</strong> ${paymentReference}</p>
                            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                            <p><strong>Mode de paiement :</strong> ${paymentMode.organization || paymentMode.type}</p>
                        </div>
                        
                        <p>Merci pour votre confiance et à bientôt pour votre prochain voyage !</p>
                        
                        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                        
                        <p style="color: #7f8c8d; font-size: 12px;">
                            Ceci est un message automatique, merci de ne pas y répondre.
                        </p>
                    </div>
                `;

                await NotificationService.sendEmail(customerEmail, emailSubjectCustomer, emailBodyCustomer);
                console.log(`📧 Email envoyé au client: ${customerEmail}`);
            } catch (emailError) {
                console.error("Erreur envoi email au client:", emailError);
            }
        }

        await t.commit();

        // Récupérer le paiement avec ses relations pour la réponse
        const completedPayment = await Payment.findByPk(payment.id, {
            include: [
                { 
                    model: PaymentMode, 
                    as: "paymentMode",
                    attributes: ['id', 'name', 'type', 'organization', 'accountNumber', 'status']
                },
                {
                    model: Invoice,
                    as: "invoice",
                    attributes: ['id', 'reference', 'total', 'paid', 'balance', 'status']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Paiement effectué avec succès",
            data: {
                payment: completedPayment,
                invoice: {
                    id: invoice.id,
                    reference: invoice.reference,
                    total: invoice.total,
                    paid: invoice.paid,
                    balance: invoice.balance,
                    status: invoice.status
                }
            }
        });

    } catch (error) {
        await t.rollback();
        console.error("❌ Erreur lors du traitement du paiement:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur interne du serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// exports.createPayment = catchAsync(async (req, res) => {
//     const { invoiceId, paymentModeId, amount, reference } = req.body;
    
//     const invoice = await Invoice.findByPk(invoiceId);
//     if (!invoice) {
//         throw new AppError('Invoice not found', 404);
//     }

//     // Vérifier que l'utilisateur a le droit de payer cette facture
//     if (req.user.role === 'customer' && invoice.customerId !== req.user.id) {
//         throw new AppError('You are not authorized to pay this invoice', 403);
//     }

//     const payment = await Payment.create({
//         invoiceId,
//         paymentModeId,
//         amount,
//         reference,
//         status: 'completed',
//         createdBy: req.user.id
//     });

//     // Mettre à jour le statut de la facture
//     const totalPaid = await Payment.sum('amount', { where: { invoiceId } });
//     if (totalPaid >= invoice.amount) {
//         invoice.status = 'paid';
//     } else if (totalPaid > 0) {
//         invoice.status = 'partial';
//     }
//     invoice.balance = invoice.amount - totalPaid;
//   await invoice.save();
//     await invoice.save();

//     res.status(201).json({
//         status: 'success',
//         data: payment
//     });
// });

// exports.createPayment = async (req, res) => {
//     const { invoiceId, paymentModeId, amount } = req.body;
//    console.log('req.body',req.body)
//     // Vérifier l'existence de la facture
//     const invoice = await Invoice.findByPk(invoiceId);
//     if (!invoice) {
//       throw new AppError("Invoice not found", 404);
//     }
  
//     // Vérifier que l'utilisateur est autorisé à payer cette facture
//     // if (req.user.role === "customer" && invoice.customerId !== req.user.id) {
//     //   throw new AppError("You are not authorized to pay this invoice", 403);
//     // }
  
//     // Vérifier que le montant du paiement ne dépasse pas le solde restant
//     if (amount > invoice.balance) {
//       throw new AppError(
//         `Payment amount exceeds the remaining balance of ${invoice.balance.toFixed(2)} €`,
//         400
//       );
//     }
  
//     // Vérifier le mode de paiement
//     const paymentMode = await PaymentMode.findByPk(paymentModeId);
//     if (!paymentMode || paymentMode.status !== "active") {
//       throw new AppError("Invalid or inactive payment mode", 400);
//     }
//     const generateInvoiceReference = () => {
//         return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//     };
//     // Enregistrer le paiement
//     const payment = await Payment.create({
//       invoiceId,
//       modePaymentId: paymentModeId,
//       amount,
      
//       paymentDate: new Date(),
//       status: "completed",
//       createdBy: req.user.id,
//     });
  
//     // Mettre à jour la balance et le statut de la facture
//     invoice.balance -= amount;
//     if (invoice.balance <= 0) {
//       invoice.status = "paid"; // Facture entièrement payée
//       invoice.balance = 0; // Évite les valeurs négatives
//     } else {
//       invoice.status = "partial"; // Facture partiellement payée
//     }
//     await invoice.save();
  
//     res.status(201).json({
//       status: "success",
//       message: "Payment successfully processed",
//       data: { payment, invoice },
//     });
//   };
// exports.createPayment = async (req, res) => {
//     try {
//       const { invoiceId, paymentModeId, amount, reference } = req.body;
  
//       // Vérifier l'existence de la facture
//       const invoice = await Invoice.findByPk(invoiceId);
//       if (!invoice) {
//         return res.status(404).json({ message: "Invoice not found" });
//       }
  
//       // Vérifier que le montant du paiement ne dépasse pas le solde restant
//       if (amount > invoice.balance) {
//         return res.status(400).json({
//           message: `Payment amount exceeds the remaining balance of ${invoice.balance.toFixed(2)} XOF`,
//         });
//       }
  
//       // Vérifier le mode de paiement
//       const paymentMode = await PaymentMode.findByPk(paymentModeId);
//       if (!paymentMode || paymentMode.status !== "active") {
//         return res.status(400).json({ message: "Invalid or inactive payment mode" });
//       }
  
//       // Générer une référence si elle est absente ou vide
//       const generatePaymentReference = () => {
//         return `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//       };
  
//       const paymentReference = reference && reference.trim() !== "" ? reference : generatePaymentReference();
  
//       // Enregistrer le paiement
//       const payment = await Payment.create({
//         invoiceId,
//         modePaymentId: paymentModeId,
//         amount,
//         reference: paymentReference, // Ajout de la référence ici
//         paymentDate: new Date(),
//         status: "completed",
//         createdBy: req.user.id,
//       });
  
//       // Mettre à jour la balance et le statut de la facture
//       invoice.balance -= amount;
//       invoice.status = invoice.balance <= 0 ? "paid" : "partial";
//       await invoice.save();
  
//       res.status(201).json({
//         status: "success",
//         message: "Payment successfully processed",
//         data: { payment, invoice },
//       });
//     } catch (error) {
//       console.error("Error processing payment:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   };
// exports.createPayment = async (req, res) => {
//     try {
//         const { invoiceId, paymentModeId, amount, reference,description } = req.body;

//         // Vérifier l'existence de la facture
//         const invoice = await Invoice.findByPk(invoiceId);
//         if (!invoice) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         // Vérifier que le montant du paiement ne dépasse pas le solde restant
//         if (amount > invoice.balance) {
//             return res.status(400).json({
//                 message: `Payment amount exceeds the remaining balance of ${invoice.balance.toFixed(2)} XOF`,
//             });
//         }

//         // Vérifier le mode de paiement
//         const paymentMode = await PaymentMode.findByPk(paymentModeId);
//         if (!paymentMode || paymentMode.status !== "active") {
//             return res.status(400).json({ message: "Invalid or inactive payment mode" });
//         }

//         // Générer une référence si elle est absente ou vide
//         const generatePaymentReference = () => {
//             return `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//         };

//         const paymentReference = reference && reference.trim() !== "" ? reference : generatePaymentReference();

//         // Enregistrer le paiement avec un statut "pending" (en attente de validation)
//         const payment = await Payment.create({
//             invoiceId,
//             modePaymentId: paymentModeId,
//             amount,
//             reference: paymentReference,
//             paymentDate: new Date(),
//             description,
//             status: "pending", // En attente de validation
//             createdBy: req.user.id,
//         });

//         res.status(201).json({
//             status: "success",
//             message: "Payment submitted for approval",
//             data: { payment },
//         });
//     } catch (error) {
//         console.error("Error processing payment:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };
// code de payment sans deduction de la balance 
// exports.createPayment = async (req, res) => {
//     try {
//         const { invoiceId, paymentModeId, amount, reference, description } = req.body;

//         // Vérifier l'existence de la facture
//         const invoice = await Invoice.findByPk(invoiceId, {
//             include: { model: Agency, as: "agencyIvoice", include: { model: User, as: "User" } },
//             include:{model:Customer,as:'customer',include:{model:User,as:'user'}}
//         });
//         if (!invoice) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         // Vérifier que le montant du paiement ne dépasse pas le solde restant
//         if (amount > invoice.balance) {
//             return res.status(400).json({
//                 message: `Payment amount exceeds the remaining balance of ${invoice.balance.toFixed(2)} XOF`,
//             });
//         }

//         // Vérifier le mode de paiement
//         const paymentMode = await PaymentMode.findByPk(paymentModeId);
//         if (!paymentMode || paymentMode.status !== "active") {
//             return res.status(400).json({ message: "Invalid or inactive payment mode" });
//         }

//         // Générer une référence si elle est absente ou vide
//         const generatePaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//         const paymentReference = reference && reference.trim() !== "" ? reference : generatePaymentReference();

//         // Enregistrer le paiement avec un statut "pending"
//         const payment = await Payment.create({
//             invoiceId,
//             modePaymentId: paymentModeId,
//             amount,
//             reference: paymentReference,
//             paymentDate: new Date(),
//             description,
//             status: "pending",
//             createdBy: req.user.id,
//         });

//         // Récupérer l'email de l'utilisateur de l'agence
//          const agencyUserEmail = invoice.agencyIvoice?.User?.email;
//         // const agencyUserEmail ='sankareamadou700@yahoo.fr'
//         const customerlastName=invoice.customer.lastName
//         const customerFirstName=invoice.customer.firstName
//         console.log('customerFirstName',customerFirstName)

//         console.log('customerlastName',customerlastName)
//         if (agencyUserEmail) {
//             const emailSubject = "Nouveau paiement en attente de validation";
//             const emailBody = `
//                 <p>Un paiement a été effectué par le  <p> client: <strong>${customerFirstName} ${customerlastName}</strong>
//                 </p> pour la facture de reference <strong>${invoice.reference}</strong>.</p>
//                 </p> Montant de la facture <strong>${invoice.balance}</strong>.</p>

//                 <p>Montant effectue par le client: <strong>${amount} XOF</strong></p>
//                 <p>Référence Payment: <strong>${paymentReference}</strong></p>
//                 <p>Mode de paiement: <strong>${paymentMode.name}</strong></p>
//                 <p>Veuillez valider ce paiement depuis votre espace de gestion paiement.</p>
//             `;

//             await NotificationService.sendEmail(
//                 agencyUserEmail,
//                 emailSubject,
//                 emailBody,
//                 { html: true }
//             );
//         }

//         res.status(201).json({
//             status: "success",
//             message: "Payment submitted for approval. Notification sent to the agency.",
//             data: { payment },
//         });
//     } catch (error) {
//         console.error("Error processing payment:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

// exports.getPayments = async (req, res) => {
//     const payments = await Payment.findAll({
//         include: [
//             {
//                 model: Invoice,
//                 as: 'invoice',
//                 where: req.user.role === 'customer' ? { customerId: req.user.id } : {}
//             },
//             {
//                 model: PaymentMode,
//                 as: 'paymentMode'
//             }
//         ]
//     });

//     res.status(200).json({
//         status: 'success',
//         results: payments.length,
//         data: payments
//     });
// };

// exports.getPayment = async (req, res) => {
//     const payment = await Payment.findByPk(req.params.id, {
//         include: [
//             {
//                 model: Invoice,
//                 as: 'invoice'
//             },
//             {
//                 model: PaymentMode,
//                 as: 'paymentMode'
//             }
//         ]
//     });

//     if (!payment) {
//         throw new AppError('Payment not found', 404);
//     }

//     // Vérifier l'autorisation
//     if (req.user.role === 'customer' && payment.invoice.customerId !== req.user.id) {
//         throw new AppError('You are not authorized to view this payment', 403);
//     }

//     res.status(200).json({
//         status: 'success',
//         data: payment
//     });
// };
// exports.getPayment = async (req, res) => {
//     try {
//         const payment = await Payment.findByPk(req.params.id, {
//             include: [
//                 {
//                     model: Invoice,
//                     as: 'invoicePayment',
//                     attributes: ['id', 'customerId', 'agencyId']
//                 },
//                 {
//                     model: PaymentMode,
//                     as: 'paymentMode'
//                 }
//             ],
//             raw: true, // 🔍 Voir la structure des données
//             nest: true
//         });
//         console.log(payment);
//         if (!payment) {
//             throw new AppError('Payment not found', 404);
//         }
 
//         // Vérifier si l'utilisateur est un Customer
//         const customer = await Customer.findOne({ where: { userId: req.user.id } });
//         if (customer && payment.invoice.customerId !== customer.id) {
//             throw new AppError('You are not authorized to view this payment', 403);
//         }

//         // Vérifier si l'utilisateur est une Agency
//         const agency = await Agency.findOne({ where: { userId: req.user.id } });
//         if (agency && payment.invoice.agencyId !== agency.id) {
//             throw new AppError('You are not authorized to view this payment', 403);
//         }

//         res.status(200).json({
//             status: 'success',
//             data: payment
//         });
//     } catch (error) {
//         console.error("Error fetching payment:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };

exports.createPayments = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { invoiceId, paymentModeId, amount, reference, description } = req.body;

        // Récupérer la facture avec ses relations
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                { model: Agency, as: "agencyInvoice", include: { model: User, as: "User" } },
                { model: Customer, as: "customer", include: { model: User, as: "user" } }
            ],
            transaction: t
        });

        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ message: "Facture introuvable" });
        }

        // Vérifier que le montant du paiement ne dépasse pas le solde
        if (amount > invoice.balance) {
            await t.rollback();
            return res.status(400).json({
                message: `Le montant du paiement dépasse le solde restant de ${invoice.balance.toFixed(2)} XOF`,
            });
        }

        // Vérifier le mode de paiement
        const paymentMode = await PaymentMode.findByPk(paymentModeId, { transaction: t });
        if (!paymentMode || paymentMode.status !== "active") {
            await t.rollback();
            return res.status(400).json({ message: "Mode de paiement invalide ou inactif" });
        }

        // Générer une référence si elle est absente
        const generatePaymentReference = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const paymentReference = reference && reference.trim() !== "" ? reference : generatePaymentReference();

        // Créer le paiement avec un statut "completed"
        const payment = await Payment.create({
            invoiceId,
            modePaymentId: paymentModeId,
            amount,
            reference: paymentReference,
            paymentDate: new Date(),
            description,
            status: "completed", // Le paiement est directement marqué comme complété
            createdBy: req.user.id,
        }, { transaction: t });

        // Déduire le montant du solde de la facture
        invoice.balance -= amount;

        // Vérifier si la facture est totalement payée
        invoice.status = invoice.balance <= 0 ? "paid" : "partial";
        await invoice.save({ transaction: t });

        // Récupérer les emails des utilisateurs concernés
        const agencyUserEmail = invoice.agencyIvoice?.User?.email;
        const customerEmail = invoice.customer?.user?.email; 
        const customerFirstName = invoice.customer?.firstName || "";
        const customerLastName = invoice.customer?.lastName || "";

        // Envoi d'email à l'agence
        if (agencyUserEmail) {
            const emailSubjectAgency = "Paiement reçu";
            const emailBodyAgency = `
                <p>Un paiement a été effectué par le client <strong>${customerFirstName} ${customerLastName}</strong></p>
                <p>Pour la facture de référence : <strong>${invoice.reference}</strong></p>
                <p>Montant initial de la facture : <strong>${(invoice.balance + amount).toFixed(2)} XOF</strong></p>
                <p>Montant payé : <strong>${amount.toFixed(2)} XOF</strong></p>
                <p>Solde restant : <strong>${invoice.balance.toFixed(2)} XOF</strong></p>
                <p>Statut de la facture : <strong>${invoice.status}</strong></p>
            `;

            await NotificationService.sendEmail(agencyUserEmail, emailSubjectAgency, emailBodyAgency, { html: true });
        }

        // Envoi d'email au client
        if (customerEmail) {
            const emailSubjectCustomer = "Paiement de votre facture validé";
            const emailBodyCustomer = `
                <p>Votre paiement pour la facture <strong>#${invoice.reference}</strong> a été validé avec succès.</p>
                <p>Montant payé: <strong>${amount.toFixed(2)} XOF</strong></p>
                <p>Référence du paiement: <strong>${paymentReference}</strong></p>
                <p>Merci pour votre confiance.</p>
            `;

            await NotificationService.sendEmail(customerEmail, emailSubjectCustomer, emailBodyCustomer, { html: true });
        }

        await t.commit();

        res.status(201).json({
            status: "success",
            message: "Paiement complété et facture mise à jour. Emails envoyés.",
            data: { payment, invoice },
        });

    } catch (error) {
        await t.rollback();
        console.error("Erreur lors du traitement du paiement:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};


exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                {
                    model: Invoice,
                    as: 'invoicePayment',
                    attributes: ['id', 'customerId', 'agencyId','amount', 'status', 'balance', 'totalWithTax','reference'],
                    include:{model:Customer,as:'customer'}
                },
                {
                    model: PaymentMode,
                    as: 'paymentMode'
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        console.log("Payment fetched:", payment);

        // ✅ Vérifier que invoicePayment existe
        if (!payment.invoicePayment) {
            return res.status(400).json({ message: "Invoice not found for this payment" });
        }

        const { customerId, agencyId } = payment.invoicePayment.dataValues || {};

        console.log("Invoice Data:", { customerId, agencyId });

        // ✅ Vérifier si l'utilisateur est un client ou une agence
        let hasAccess = false;

        const customer = await Customer.findOne({ where: { userId: req.user.id } });
        if (customer) {
            if (customerId && customerId === customer.id) {
                hasAccess = true;
            }
        }

        const agency = await Agency.findOne({ where: { userId: req.user.id } });
        if (agency) {
            if (agencyId && agencyId === agency.id) {
                hasAccess = true;
            }
        }

        // ✅ Si l'utilisateur n'a pas accès, renvoyer une erreur
        if (!hasAccess) {
            return res.status(403).json({ message: 'You are not authorized to view this payment' });
        }

        res.status(200).json({
            status: 'success',
            data: payment
        });
    } catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




// exports.getPayments = async (req, res, next) => {
//     try {
//         let whereCondition = {};

//         // Trouver simultanément si l'utilisateur est un Customer ou une Agency
//         const [customer, agency] = await Promise.all([
//             Customer.findOne({ where: { userId: req.user.id } }),
//             Agency.findOne({ where: { userId: req.user.id } })
//         ]);

//         if (customer) {
//             whereCondition['$invoicePayment.customerId$'] = customer.id;
//         } else if (agency) {
//             whereCondition['$invoicePayment.agencyId$'] = agency.id;
//         } else {
//             return next(new AppError('No associated Customer or Agency found for this user', 404));
//         }

//         // Récupérer les paiements avec les conditions
//         const payments = await Payment.findAll({
//             include: [
//                 {
//                     model: Invoice,
//                     as: 'invoicePayment',
//                     attributes: ['id', 'amount', 'status','balance','totalWithTax'] // Sélectionner uniquement les champs nécessaires
//                 }
//             ],
//             where: whereCondition
//         });

//         res.status(200).json({
//             status: 'success',
//             results: payments.length,
//             data: payments
//         });

//     } catch (error) {
//         console.error("Error fetching payments:", error);
//         next(new AppError("Internal Server Error", 500));
//     }
// };
exports.getPayments = async (req, res, next) => {
    try {
        let whereCondition = {};

        // Vérifier si l'utilisateur est un Customer ou une Agency
        const [customer, agency] = await Promise.all([
            Customer.findOne({ where: { userId: req.user.id } }),
            Agency.findOne({ where: { userId: req.user.id } })
        ]);

        if (customer) {
            whereCondition['$invoicePayment.customerId$'] = customer.id;
        } else if (agency) {
            whereCondition['$invoicePayment.agencyId$'] = agency.id;
        } else {
            return next(new AppError('No associated Customer or Agency found for this user', 404));
        }

        // Récupérer les paiements en incluant la facture et le client associé
        const payments = await Payment.findAll({
            include: [
                {
                    model: Invoice,
                    as: 'invoicePayment',
                    attributes: ['id', 'amount', 'status', 'balance', 'totalWithTax'],
                    include: [
                        {
                            model: Customer,
                            as: 'customer',
                            attributes: ['id', 'firstName', 'lastName'] // Sélectionner les infos essentielles du client
                        }
                    ]
                }
            ],
            where: whereCondition
        });

        res.status(200).json({
            status: 'success',
            results: payments.length,
            data: payments
        });

    } catch (error) {
        console.error("Error fetching payments:", error);
        next(new AppError("Internal Server Error", 500));
    }
};
exports.updatePayment = catchAsync(async (req, res) => {
    const { status, reference } = req.body;
    
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
        throw new AppError('Payment not found', 404);
    }

    // Mise à jour des champs autorisés
    if (status) payment.status = status;
    if (reference) payment.reference = reference;
    
    payment.updatedBy = req.user.id;
    await payment.save();

    res.status(200).json({
        status: 'success',
        data: payment
    });
});

exports.getPaymentModes = catchAsync(async (req, res) => {
    const paymentModes = await PaymentMode.findAll({
        where: { status: 'active' }
    });

    res.status(200).json({
        status: 'success',
        data: paymentModes
    });
});
// exports.validatePayment = async (req, res) => {
//     try {
//       console.log("Utilisateur authentifié :", req.user);
  
//       if (!req.user) {
//         return res.status(401).json({ message: "Unauthorized: User not found" });
//       }
  
//       const { id } = req.params;
//       const payment = await Payment.findByPk(id, {
//         include: { model: Invoice, as: "invoicePayment" }
//       });
  
//       if (!payment) {
//         return res.status(404).json({ message: "Payment not found" });
//       }
  
//       if (payment.status === "completed") {
//         return res.status(400).json({ message: "Payment already validated" });
//       }
  
//       const agency = await Agency.findOne({ where: { userId: req.user.id } });
  
//       if (!agency) {
//         return res.status(403).json({ message: "Unauthorized: You are not an agency" });
//       }
  
//       if (payment.invoicePayment.agencyId !== agency.id) {
//         return res.status(403).json({ message: "Unauthorized: Payment does not belong to your agency" });
//       }
  
//       // ✅ Validation du paiement (paiement en tranche pris en compte)
//       payment.status = "completed";
//       await payment.save();
  
//       const invoice = payment.invoicePayment;
  
//       // Vérifier que le paiement ne dépasse pas le montant restant
//       if (payment.amount > invoice.balance) {
//         return res.status(400).json({ message: "Payment amount exceeds remaining balance" });
//       }
  
//       invoice.balance -= payment.amount;
  
//       // Vérifier si la balance atteint 0 => Mettre l'invoice comme "paid"
//       invoice.status = invoice.balance <= 0 ? "paid" : "partial";
//       await invoice.save();
  
//       res.status(200).json({
//         message: "Payment validated successfully",
//         payment,
//         invoice,
//       });
//     } catch (error) {
//       console.error("Error validating payment:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   };
  // validate Payment avec send email
//   exports.validatePayment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const payment = await Payment.findByPk(id, {
//             include: { 
//                 model: Invoice, 
//                 as: "invoicePayment", 
//                 include: [
//                     { model: Customer, as: "customerInvoice", include: { model: User, as: "user" } },
//                     { model: Agency, as: "agencyInvoice", include: { model: User, as: "User" } }
//                 ] 
//             }
//         });

//         if (!payment) {
//             return res.status(404).json({ message: "Payment not found" });
//         }

//         payment.status = "completed";
//         await payment.save();

//         const invoice = payment.invoicePayment;
//         invoice.balance -= payment.amount;
//         invoice.status = invoice.balance <= 0 ? "paid" : "partial";
//         await invoice.save();

//         const agencyEmail = invoice.agencyInvoice?.user?.email;
//         const customerEmail = invoice.customerInvoice?.user?.email;

//         // 🔔 Notifier le client
//         await sendNotification(invoice.customerInvoice.id, "Paiement validé",
//             `Votre paiement de ${payment.amount} XOF a été validé.`);

//         // 📧 Envoyer un e-mail au client
//         if (customerEmail) {
//             await sendEmail(customerEmail, "Votre paiement a été validé",
//                 `<p>Votre paiement de <strong>${payment.amount} XOF</strong> a été validé.</p>
//                 <p>Balance restante : <strong>${invoice.balance} XOF</strong></p>
//                 <p>Merci pour votre confiance.</p>`);
//         }

//         // 🔔 Notifier l'agence
//         await sendNotification(invoice.agencyInvoice.id, "Paiement reçu",
//             `Un paiement de ${payment.amount} XOF a été validé pour la facture ${invoice.id}.`);

//         // 📧 Envoyer un e-mail à l'agence
//         if (agencyEmail) {
//             await sendEmail(agencyEmail, "Paiement reçu",
//                 `<p>Un paiement de <strong>${payment.amount} XOF</strong> a été validé pour la facture ${invoice.id}.</p>`);
//         }

//         res.status(200).json({
//             message: "Payment validated successfully and notifications sent",
//             payment,
//             invoice,
//         });
//     } catch (error) {
//         console.error("Error validating payment:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };
exports.validatePayment = async (req, res) => { 
    try {
        console.log("Utilisateur authentifié :", req.user);

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        const { id } = req.params;
        const payment = await Payment.findByPk(id, {
            include: { 
                model: Invoice, 
                as: "invoicePayment",
                include: { 
                    model: Customer, 
                    as: "customer", 
                    include: { model: User, as: "user" } 
                } 
            }
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status === "completed") {
            return res.status(400).json({ message: "Payment already validated" });
        }

        const agency = await Agency.findOne({ where: { userId: req.user.id } });

        if (!agency) {
            return res.status(403).json({ message: "Unauthorized: You are not an agency" });
        }

        if (payment.invoicePayment.agencyId !== agency.id) {
            return res.status(403).json({ message: "Unauthorized: Payment does not belong to your agency" });
        }

        // ✅ Validation du paiement (paiement en tranche pris en compte)
        payment.status = "completed";
        await payment.save();

        const invoice = payment.invoicePayment;

        // Vérifier que le paiement ne dépasse pas le montant restant
        if (payment.amount > invoice.balance) {
            return res.status(400).json({ message: "Payment amount exceeds remaining balance" });
        }

        invoice.balance -= payment.amount;

        // Vérifier si la balance atteint 0 => Mettre l'invoice comme "paid"
        invoice.status = invoice.balance <= 0 ? "paid" : "partial";
        await invoice.save();

        // Récupérer l'email du client depuis User lié à Customer
        const customerEmail = payment.invoicePayment?.customer?.user?.email;

        if (customerEmail) {
            const emailSubject = "Confirmation de validation de paiement";
            const emailBody = `
                <p>Votre paiement pour la facture <strong>#${invoice.reference}</strong> a été validé avec succès.</p>
                <p>Montant payé: <strong>${payment.amount} XOF</strong></p>
                <p>Référence du paiement: <strong>${payment.reference}</strong></p>
                <p>Merci pour votre confiance.</p>
            `;

            await NotificationService.sendEmail(
                customerEmail,
                emailSubject,
                emailBody,
                { html: true }
            );
        }

        res.status(200).json({
            message: "Payment validated successfully. Notification sent to the customer.",
            payment,
            invoice,
        });
    } catch (error) {
        console.error("Error validating payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

  exports.cancelPayment = async (req, res) => {
    try {
      const { id } = req.params;
  
      const payment = await Payment.findByPk(id, {
        include: { model: Invoice, as: "invoicePayment" }
      });
  
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
  
      if (payment.status === "canceled") {
        return res.status(400).json({ message: "Payment already canceled" });
      }
  
      if (payment.status === "refunded") {
        return res.status(400).json({ message: "Cannot cancel a refunded payment" });
      }
  
      const invoice = payment.invoicePayment;
  
      // Recréditer le montant dans la balance de l'Invoice
      invoice.balance += payment.amount;
      invoice.status = "partial"; // Si nécessaire, repasser en partiellement payé
      await invoice.save();
  
      // Changer le statut du paiement
      payment.status = "canceled";
      await payment.save();
  
      res.status(200).json({
        message: "Payment successfully canceled",
        payment,
        invoice
      });
    } catch (error) {
      console.error("Error canceling payment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
    
  
