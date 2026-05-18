const Brevo = require("sib-api-v3-sdk");
const socketIO = require("socket.io");

class NotificationService {
  constructor() {
    this.io = null;

    // Configuration de Brevo avec API Key
    const brevoClient = Brevo.ApiClient.instance;
    brevoClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    this.emailApi = new Brevo.TransactionalEmailsApi();
    this.smsApi = new Brevo.TransactionalSMSApi();
  }

  initializeSocket(server) {
    this.io = socketIO(server);
    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(`user-${userId}`);
      });
    });
  }

  /**
   * 📩 Envoi d'un email via Brevo
   */
  async sendEmail(to, subject, html) {
    try {
      await this.emailApi.sendTransacEmail({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Travel App" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      });

      console.log("Email envoyé via Brevo !");
      return true;
    } catch (error) {
      console.error("Erreur d'envoi d'email avec Brevo:", error);
      return false;
    }
  }

  /**
   * 📲 Envoi d'un SMS via Brevo
   */
  async sendSMS(phoneNumber, message) {
    try {
      await this.smsApi.sendTransacSms({
        sender: "MyBrand",
        recipient: phoneNumber,
        content: message,
      });

      console.log("SMS envoyé avec succès !");
      return true;
    } catch (error) {
      console.error("Échec de l'envoi du SMS:", error);
      return false;
    }
  }

  /**
   * 📡 Envoi d'une notification en temps réel via Socket.IO
   */
  sendRealTimeNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit("notification", notification);
    }
  }

  /**
   * 🔔 Gère les notifications (temps réel, email, SMS)
   */
  async notify(userId, type, message, email = null, phoneNumber = null) {
    // Notification en temps réel
    this.sendRealTimeNotification(userId, { type, message });

    // Envoi d'email
    if (email) {
      await this.sendEmail(email, `Notification: ${type}`, `<p>${message}</p>`);
    }

    // Envoi de SMS
    if (phoneNumber) {
      await this.sendSMS(phoneNumber, message);
    }
  }
}

module.exports = new NotificationService();
