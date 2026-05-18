const nodemailer = require("nodemailer");
const socketIO = require("socket.io");

class NotificationService {
  constructor() {
    this.io = null;
    this.transporter = null;
    this.initializeEmailTransporter();
  }

  /**
   * Initialisation du transporteur email LWS
   */
  async initializeEmailTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await this.verifyConnection();
      console.log("✅ LWS Email transporter initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing LWS email transporter:", error);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ LWS SMTP connection verified");
    } catch (error) {
      console.error("❌ LWS SMTP connection failed:", error);
      throw error;
    }
  }

  initializeSocket(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  /**
   * 📧 SERVICE PRINCIPAL - Envoi d'email générique
   */
  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        await this.initializeEmailTransporter();
      }

      const mailOptions = {
        from: {
          name: process.env.APP_NAME || "Travel App",
          address: process.env.SMTP_USER
        },
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      console.log(`📧 Sending email to: ${to}`);
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log("✅ Email sent successfully:", result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error("❌ Error sending email:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🎯 NOTIFICATIONS RÉSERVATIONS
   */
  async sendReservationConfirmation(reservationData, invoice) {
    try {
      const {
        id: reservationId,
        customerReservation,
        passengers = [],
        agencyReservations,
        totalPrice,
        tripType,
        startAt,
        endAt,
        status
      } = reservationData;

      if (!customerReservation?.user?.email) {
        throw new Error("Email client manquant");
      }

      const customerEmail = customerReservation.user.email;
      const customerName = `${customerReservation.user.firstName || ''} ${customerReservation.user.lastName || ''}`.trim() || 'Client';
      const agencyName = agencyReservations?.name || 'Notre Agence';
      
      const subject = `🎫 Confirmation de Réservation ${reservationId} - ${agencyName}`;
      const html = this.buildReservationConfirmationHTML(reservationData, invoice);

      const emailResult = await this.sendEmail(customerEmail, subject, html);

      // Notification en temps réel
      if (customerReservation.user.id) {
        this.sendRealTimeNotification(customerReservation.user.id, {
          type: 'reservation_confirmed',
          title: 'Réservation Confirmée',
          message: `Votre réservation ${reservationId} a été confirmée`,
          reservationId,
          timestamp: new Date()
        });
      }

      return emailResult;

    } catch (error) {
      console.error(`❌ Erreur notification réservation:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔐 NOTIFICATIONS AUTHENTIFICATION
   */
  async sendWelcomeEmail(user) {
    try {
      const subject = `👋 Bienvenue sur ${process.env.APP_NAME || 'Notre Plateforme'}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
              <p>Votre compte a été créé avec succès sur notre plateforme.</p>
              <p>Vous pouvez maintenant :</p>
              <ul>
                <li>📋 Créer des réservations</li>
                <li>👥 Gérer vos passagers</li>
                <li>📊 Suivre vos voyages</li>
                <li>💳 Payer en ligne</li>
              </ul>
              <p>Merci de nous avoir choisi !</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('❌ Erreur email de bienvenue:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordReset(user, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const subject = "🔒 Réinitialisation de votre mot de passe";
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.firstName || 'Cher client'},</h2>
              <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </p>
              <p><em>Ce lien expirera dans 1 heure.</em></p>
              <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('❌ Erreur email reset password:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 💳 NOTIFICATIONS PAIEMENTS
   */
  async sendPaymentConfirmation(payment, user, reservation) {
    try {
      const subject = `✅ Paiement Confirmé - ${payment.reference}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Paiement Confirmé</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.firstName},</h2>
              <p>Votre paiement a été traité avec succès.</p>
              
              <div class="info-box">
                <h3>Détails du paiement :</h3>
                <p><strong>Référence :</strong> ${payment.reference}</p>
                <p><strong>Montant :</strong> ${payment.amount.toLocaleString()} XOF</p>
                <p><strong>Date :</strong> ${new Date(payment.paidAt).toLocaleDateString('fr-FR')}</p>
                <p><strong>Réservation :</strong> ${reservation.id}</p>
                <p><strong>Méthode :</strong> ${payment.method}</p>
              </div>
              
              <p>Merci pour votre confiance !</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await this.sendEmail(user.email, subject, html);

      // Notification temps réel
      this.sendRealTimeNotification(user.id, {
        type: 'payment_confirmed',
        title: 'Paiement Confirmé',
        message: `Votre paiement de ${payment.amount.toLocaleString()} XOF a été confirmé`,
        paymentId: payment.id,
        timestamp: new Date()
      });

      return emailResult;
    } catch (error) {
      console.error('❌ Erreur notification paiement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏢 NOTIFICATIONS AGENCES
   */
  async sendAgencyNotification(agency, subject, message, data = {}) {
    try {
      if (!agency.User?.email) {
        throw new Error("Email agence manquant");
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Notification Agence</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${agency.name},</h2>
              <p>${message}</p>
              ${data.reservationId ? `<p><strong>Réservation :</strong> ${data.reservationId}</p>` : ''}
              ${data.amount ? `<p><strong>Montant :</strong> ${data.amount.toLocaleString()} XOF</p>` : ''}
              <p>Cordialement,<br>L'équipe ${process.env.APP_NAME}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(agency.User.email, subject, html);
    } catch (error) {
      console.error('❌ Erreur notification agence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⚠️ NOTIFICATIONS SYSTÈME
   */
  async sendSystemAlert(to, alertType, message, critical = false) {
    try {
      const subject = `⚠️ ${critical ? 'URGENT - ' : ''}Alerte Système - ${alertType}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${critical ? '#dc3545' : '#ffc107'}; color: ${critical ? 'white' : '#333'}; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${critical ? '🚨 ALERTE CRITIQUE' : '⚠️ Notification Système'}</h1>
            </div>
            <div class="content">
              <h2>${alertType}</h2>
              <p>${message}</p>
              <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p><strong>Environnement :</strong> ${process.env.NODE_ENV}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(to, subject, html);
    } catch (error) {
      console.error('❌ Erreur alerte système:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📡 NOTIFICATION TEMPS RÉEL
   */
  sendRealTimeNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit("notification", {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date()
      });
      console.log(`📡 Real-time notification sent to user-${userId}`);
    }
  }

  /**
   * 🛠️ MÉTHODES UTILITAIRES
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  buildReservationConfirmationHTML(reservationData, invoice) {
    // Votre template de réservation existant
    // ... (le code précédent pour buildReservationConfirmationHTML)
    return "<html>...</html>";
  }

  /**
   * 📊 STATUT DU SERVICE
   */
  async getServiceStatus() {
    try {
      await this.verifyConnection();
      return {
        email: true,
        realtime: !!this.io,
        smtp: {
          host: process.env.SMTP_HOST,
          user: process.env.SMTP_USER,
          port: process.env.SMTP_PORT
        }
      };
    } catch (error) {
      return {
        email: false,
        realtime: !!this.io,
        error: error.message
      };
    }
  }
}

module.exports = new NotificationService();
