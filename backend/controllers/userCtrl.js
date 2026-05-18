const User = require("../models/userModel");
const Role = require('../models/roleModel');
const UserRole = require('../models/userRoleModel');
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const NotificationService=require('../services/notification.service')
// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(
      {include:{model:UserRole,as:"userRoles"}}
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { email, password, roleId, roleName, roleDescription } = req.body;

    // Vérifier si un rôle est fourni
    let role;
    if (roleId) {
      // Vérifier si le rôle existe par son ID
      role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: "Role not found" });
      }
    } else if (roleName) {
      // Créer un nouveau rôle si le nom du rôle est fourni
      role = await Role.findOrCreate({
        where: { name: roleName },
        defaults: {
          description: roleDescription || "",
          status: "active",
          createdBy: req.user?.id || null, // Si connecté
        },
      });
      role = role[0]; // `findOrCreate` renvoie un tableau [instance, created]
    } else {
      return res.status(400).json({ message: "Role is required" });
    }

    // Créer un nouvel utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      createdBy: req.user?.id || null,
    });

    // Associer l'utilisateur au rôle
    await UserRole.create({
      userId: user.id,
      roleId: role.id,
      status: "active",
      createdBy: req.user?.id || null,
    });

    // Supprimer le mot de passe avant de renvoyer la réponse
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
      role: role.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur avec ses rôles
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: UserRole,
          as: "userRoles",
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["name"], // Récupérer uniquement le nom du rôle
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    

         // Vérifier si l'utilisateur est actif
    if (user.status !== "active") {
      return res.status(403).json({ message: "User account is not active" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Extraire les noms de rôles
    const roles = user.userRoles.map((userRole) => userRole.role.name);

    // Générer un token incluant le rôle principal (si nécessaire)
    const token = jwt.sign(
      { id: user.id, roles }, // Inclure les rôles dans le token
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user.toJSON();

    return res.json({
      user: { ...userWithoutPassword, roles },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Find user by email
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//     // Save token and expiry in DB
//     user.passwordResetToken = hashedToken;
//     user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
//     await user.save();

//     // Send reset token (e.g., via email)
//     const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
//     console.log(`Password reset URL: ${resetUrl}`);

//     res.status(200).json({ message: "Password reset link sent to your email", resetUrl });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const requestPasswordResetTest = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'email est fourni
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Rechercher l'utilisateur avec cet email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Enregistrer le token et l'expiration dans la base de données
    user.passwordResetToken = hashedToken;
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // Expire dans 10 minutes
    await user.save();

    // Construire l'URL de réinitialisation
     // Construction de l'URL (à adapter selon votre frontend)
    // Corrigez la construction de l'URL
//const frontendUrl = process.env.FRONTEND_URL || 'https://agencesvoyage.com';
//const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`; // Utilisez des backticks
         const resetUrl = `https://agencesvoyage.com/reset-password?token=${resetToken}`;  
  // Construire l'email
    const emailSubject = "Réinitialisation de votre mot de passe";
    const emailBody = `
      <p>Bonjour ${user.firstName || "Utilisateur"},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour procéder :</p>
      <p><a href="${resetUrl}" target="_blank" style="color: blue; font-weight: bold;">Réinitialiser mon mot de passe</a></p>
      <p><strong>Note :</strong> Ce lien expire dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé cette action, ignorez cet email.</p>
      <p>Merci,</p>
      <p><strong>Support Technique</strong></p>
    `;

    // Envoyer l'email via le service de notification
    await NotificationService.sendEmail(
      user.email,
      emailSubject,
      emailBody,
      { html: true }
    );

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("❌ Error during password reset request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'email est fourni
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Rechercher l'utilisateur avec cet email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Enregistrer le token et l'expiration dans la base de données
    user.passwordResetToken = hashedToken;
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // Expire dans 10 minutes
    await user.save();

    // Construire l'URL de réinitialisation
    const resetUrl = `https://agencesvoyage.com/reset-password?token=${resetToken}`;

    // Construire l'email - CORRECTION: Template HTML complet
    const emailSubject = "🔒 Réinitialisation de votre mot de passe";
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header { 
            background: #dc3545; 
            color: white; 
            padding: 20px; 
            text-align: center;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .button { 
            display: inline-block;
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${user.firstName || "Utilisateur"},</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour procéder :</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white; text-decoration: none;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p><strong>Note :</strong> Ce lien expire dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé cette action, ignorez simplement cet email.</p>
          </div>
          <div class="footer">
            <p>Merci,</p>
            <p><strong>Équipe Support Technique - Agences Voyage</strong></p>
            <p>&copy; ${new Date().getFullYear()} Agences Voyage. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // CORRECTION: Appel correct du service de notification
    const emailResult = await NotificationService.sendEmail(
      user.email,
      emailSubject,
      emailBody
    );

    if (emailResult.success) {
      console.log(`✅ Email de réinitialisation envoyé à ${user.email}`);
      res.status(200).json({
        success: true,
        message: "Lien de réinitialisation envoyé à votre email",
      });
    } else {
      console.error(`❌ Échec envoi email: ${emailResult.error}`);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'envoi de l'email de réinitialisation" 
      });
    }

  } catch (error) {
    console.error("❌ Error during password reset request:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with token
    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpire: { [Op.gt]: Date.now() }, // Token must not be expired
      },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash and set new password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpire = null;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Assuming user info is stored in `req.user` from JWT

    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Current password is incorrect" });

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loginUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateUser,
  deleteUser,
  createUser,
  getAllUsers,
  getUserById
};
