const nodemailer = require('nodemailer');
const socketIO = require('socket.io');

class NotificationService {
  constructor() {
    this.io = null;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  initializeSocket(server) {
    this.io = socketIO(server);
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join', (userId) => {
        socket.join(`user-${userId}`);
      });
    });
  }

  // async sendEmail(to, subject, html) {
  //   try {
  //     await this.transporter.sendMail({
  //       from: process.env.SMTP_FROM,
  //       to,
  //       subject,
  //       html
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error('Email sending failed:', error);
  //     return false;
  //   }
  // }
  async sendEmail(to, subject, html) {
    try {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text: "Veuillez consulter votre facture ci-jointe.", // Ajoute une version texte
            html // Contenu HTML envoyé
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
}

  sendRealTimeNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit('notification', notification);
    }
  }

  async notify(userId, type, message, email = null,phoneNumber = null) {
    // Send real-time notification
    this.sendRealTimeNotification(userId, { type, message });

    // Send email if provided
    if (email) {
      await this.sendEmail(
        email,
        `Notification: ${type}`,
        `<p>${message}</p>`
      );
    }
    if (phoneNumber) {
      await this.sendSMS(phoneNumber, message);
    }
  }
  async sendSMS(phoneNumber, message) {
    try {
      const smsApi = new Brevo.TransactionalSMSApi();
  
      await smsApi.sendTransacSms({
        sender: "YourBrand",
        recipient: phoneNumber,
        content: message
      });
  
      console.log("SMS sent successfully");
      return true;
    } catch (error) {
      console.error("SMS sending failed:", error);
      return false;
    }
  }
  
}

module.exports = new NotificationService();
