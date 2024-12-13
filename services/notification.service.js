const nodemailer = require('nodemailer');
const socketIO = require('socket.io');

class NotificationService {
  constructor() {
    this.io = null;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
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

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
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

  async notify(userId, type, message, email = null) {
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
  }
}

module.exports = new NotificationService();
