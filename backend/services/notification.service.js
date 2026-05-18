const nodemailer = require("nodemailer");
const socketIO = require("socket.io");

class NotificationService {
  constructor() {
    this.io = null;
    this.transporter = null;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialisation avec fallback automatique
   */
  async initializeEmailTransporter() {
    const configs = [
      // Configuration principale - Port 587
      {
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        name: 'Port 587 (STARTTLS)'
      },
      // Configuration alternative - Port 465
      {
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        name: 'Port 465 (SSL)'
      },
      // Configuration de secours - Port 25
      {
        host: process.env.SMTP_HOST,
        port: 25,
        secure: false,
        name: 'Port 25 (Fallback)'
      }
    ];

    for (const config of configs) {
      try {
        console.log(`\n🔄 Tentative de connexion: ${config.name}`);
        
        this.transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000
        });

        await this.transporter.verify();
        this.isInitialized = true;
        
        console.log(`✅ Connexion réussie avec ${config.name}`);
        console.log(`   Serveur: ${config.host}:${config.port}`);
        console.log(`   Sécurité: ${config.secure ? 'SSL/TLS' : 'STARTTLS'}`);
        
        // Mise à jour des variables d'environnement pour la session
        process.env.SMTP_PORT = config.port.toString();
        process.env.SMTP_SECURE = config.secure.toString();
        
        return true;
        
      } catch (error) {
        console.log(`❌ Échec ${config.name}: ${error.message}`);
        continue;
      }
    }

    console.error('💥 Toutes les configurations SMTP ont échoué');
    this.showTroubleshootingGuide();
    return false;
  }

  /**
   * Guide de dépannage détaillé
   */
  showTroubleshootingGuide() {
    console.log('\n🔧 GUIDE DE DÉPANNAGE LWS COMPLET');
    console.log('=' .repeat(50));
    
    console.log('\n1. 🎯 VÉRIFIEZ VOS IDENTIFIANTS LWS:');
    console.log('   • Connectez-vous à https://lws.fr/');
    console.log('   • Allez dans "Webmail" ou "Emails"');
    console.log('   • Vérifiez que le compte contact@agencesvoyage.com existe');
    console.log('   • Vérifiez le mot de passe du compte email');
    
    console.log('\n2. 🌐 TEST DE CONNECTIVITÉ:');
    console.log('   Ouvrez un terminal et exécutez:');
    console.log('   telnet mail.agencesvoyage.com 587');
    console.log('   ou');
    console.log('   telnet mail.agencesvoyage.com 465');
    
    console.log('\n3. 🔧 CONFIGURATIONS ALTERNATIVES À ESSAYER:');
    console.log('   Configuration A (Recommandée):');
    console.log('   SMTP_HOST=mail.agencesvoyage.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');
    
    console.log('\n   Configuration B:');
    console.log('   SMTP_HOST=mail.agencesvoyage.com');
    console.log('   SMTP_PORT=465');
    console.log('   SMTP_SECURE=true');
    
    console.log('\n   Configuration C:');
    console.log('   SMTP_HOST=smtp.agencesvoyage.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_SECURE=false');
    
    console.log('\n4. 📞 CONTACT SUPPORT LWS:');
    console.log('   • Support technique LWS: https://aide.lws.fr/');
    console.log('   • Demandez les paramètres SMTP exacts');
    console.log('   • Vérifiez que le service SMTP est activé sur votre hébergement');
  }

  /**
   * Test de connexion détaillé
   */
  async testConnection() {
    console.log('\n🧪 TEST DE CONNEXION SMTP DÉTAILLÉ');
    console.log('=' .repeat(40));
    
    console.log('1. Informations de configuration:');
    console.log('   📧 Email:', process.env.SMTP_USER);
    console.log('   🖥️ Serveur:', process.env.SMTP_HOST);
    console.log('   🔌 Ports testés: 587, 465, 25');
    console.log('   🔒 Méthodes: STARTTLS, SSL');
    
    console.log('\n2. Test de résolution DNS:');
    try {
      const dns = require('dns');
      await new Promise((resolve, reject) => {
        dns.lookup(process.env.SMTP_HOST, (err, address) => {
          if (err) reject(err);
          else {
            console.log('   ✅ DNS résolu:', address);
            resolve(address);
          }
        });
      });
    } catch (dnsError) {
      console.log('   ❌ Erreur DNS:', dnsError.message);
    }

    console.log('\n3. Test de connexion SMTP:');
    const success = await this.initializeEmailTransporter();
    
    if (success) {
      console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS!');
      return true;
    } else {
      console.log('\n💥 CERTAINS TESTS ONT ÉCHOUÉ');
      return false;
    }
  }

  /**
   * Envoi d'email avec reprise automatique
   */
  async sendEmail(to, subject, html, text = null) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (!this.isInitialized) {
          await this.initializeEmailTransporter();
        }
                 
            // ✅ CONVERSION ET VALIDATION RENFORCÉE
            let htmlContent;
            if (typeof html === 'string') {
                htmlContent = html;
            } else if (Buffer.isBuffer(html)) {
                htmlContent = html.toString('utf8');
            } else if (typeof html === 'object') {
                htmlContent = JSON.stringify(html);
                console.warn('⚠️ Contenu HTML converti depuis Object');
            } else {
                htmlContent = String(html);
            }

            // ✅ VÉRIFICATION STRICTE
            if (typeof htmlContent !== 'string') {
                throw new Error(`HTML doit être string, reçu: ${typeof html}`);
            }

            // ✅ NETTOYAGE DU CONTENU HTML
            htmlContent = htmlContent.trim();

            console.log(`📧 Type du contenu HTML: ${typeof htmlContent}, Longueur: ${htmlContent.length}`);
            console.log(`📧 Début du HTML: ${htmlContent.substring(0, 100)}...`);

        const mailOptions = {
          from: {
            name: process.env.APP_NAME || "Agences Voyage",
            address: process.env.SMTP_USER
          },
          to: Array.isArray(to) ? to : [to],
          subject,
          html:htmlContent,
          text: text || this.stripHtml(htmlContent),
        };
          // ✅ DEBUG DES OPTIONS D'EMAIL
            console.log('📧 MailOptions préparées:', {
                to: mailOptions.to,
                subject: mailOptions.subject,
                htmlLength: mailOptions.html.length,
                textLength: mailOptions.text?.length
            });

            console.log(`📧 Tentative ${attempt}/${this.maxRetries} vers: ${to}`);
        console.log(`📧 Tentative ${attempt}/${this.maxRetries} vers: ${to}`);
        const result = await this.transporter.sendMail(mailOptions);
        
        console.log("✅ Email envoyé avec succès");
        return {
          success: true,
          messageId: result.messageId,
          attempt: attempt
        };
        
      } catch (error) {
        console.log(`❌ Tentative ${attempt} échouée: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          // Réinitialiser le transporteur pour la prochaine tentative
          this.isInitialized = false;
          this.transporter = null;
          console.log(`🔄 Nouvelle tentative dans 2 secondes...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          return {
            success: false,
            error: error.message,
            attempts: attempt
          };
        }
      }
    }
  }

  /**
   * Test d'envoi d'email simple
   */
  async sendTestEmail() {
    console.log('\n📨 TEST D\'ENVOI D\'EMAIL');
    console.log('=' .repeat(30));
    
    const testResult = await this.sendEmail(
      process.env.SMTP_USER,
      'Test SMTP LWS - ' + new Date().toLocaleString('fr-FR'),
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #28a745;">✅ Test Réussi!</h1>
          <p>Votre configuration SMTP LWS fonctionne correctement.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p><strong>Détails:</strong></p>
            <ul>
              <li>Serveur: ${process.env.SMTP_HOST}</li>
              <li>Port: ${process.env.SMTP_PORT}</li>
              <li>Compte: ${process.env.SMTP_USER}</li>
              <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
            </ul>
          </div>
        </div>
      `
    );

    return testResult;
  }

  /**
   * Initialisation du transporteur email LWS
   */

  /**
   * 📧 SERVICE PRINCIPAL - Envoi d'email avec gestion d'erreurs
  /**
   * 🧪 TEST DE CONFIGURATION SMTP
   */
  async testSmtpConfiguration() {
    console.log('\n🧪 TEST DE CONFIGURATION SMTP LWS');
    console.log('=' .repeat(50));
    
    // Vérification des variables d'environnement
    console.log('1. Vérification des variables d\'environnement:');
    const envVars = {
      'SMTP_HOST': process.env.SMTP_HOST,
      'SMTP_PORT': process.env.SMTP_PORT || '587 (default)',
      'SMTP_USER': process.env.SMTP_USER,
      'SMTP_PASSWORD': process.env.SMTP_PASSWORD ? '***' : 'MANQUANT',
      'APP_NAME': process.env.APP_NAME
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Test de connexion
    console.log('\n2. Test de connexion SMTP:');
    try {
      const initSuccess = await this.initializeEmailTransporter();
      if (!initSuccess) {
        return {
          success: false,
          message: 'Échec de l\'initialisation SMTP',
          step: 'initialization'
        };
      }

      // Test d'envoi
      console.log('\n3. Test d\'envoi d\'email:');
      const testEmail = await this.sendEmail(
        process.env.SMTP_USER, // Envoyer à soi-même pour le test
        'Test de Configuration SMTP LWS',
        `
          <h1>Test Réussi! 🎉</h1>
          <p>Votre configuration SMTP LWS fonctionne correctement.</p>
          <p><strong>Détails:</strong></p>
          <ul>
            <li>Serveur: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT || 587}</li>
            <li>Compte: ${process.env.SMTP_USER}</li>
            <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        `
      );

      return {
        success: testEmail.success,
        message: testEmail.success ? 
          'Configuration SMTP LWS validée avec succès!' : 
          'Échec de l\'envoi de test',
        details: testEmail
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors du test SMTP',
        error: error.message
      };
    }
  }
       /**
     * Envoie une notification au client pour une contre-proposition de vol
     */
    static async sendCounterProposalToCustomer(originalReservation, counterProposal, proposedVol, proposedClass, proposedPrice, notes = '') {
        try {
            const customerEmail = originalReservation.customerReservation?.user?.email;
            const customerFirstName = originalReservation.customerReservation?.user?.firstName || "N/A";
            const customerLastName = originalReservation.customerReservation?.user?.lastName || "N/A";
            const agencyName = originalReservation.agencyReservations?.name || "N/A";

            if (!customerEmail) {
                console.warn(`⚠️ Aucune adresse email client trouvée pour la contre-proposition ${counterProposal.id}`);
                return { success: false, error: "Email client manquant" };
            }

            // Récupérer les détails du vol original
            const originalVol = originalReservation.vols;
            const originalClass = originalReservation.class;
            const originalPrice = originalReservation.totalPrice;

            const emailSubject = `🎯 Nouvelle Proposition pour votre Réservation #${originalReservation.id}`;
            const emailBody = this.generateCounterProposalTemplate({
                originalReservation,
                counterProposal,
                customerFirstName,
                customerLastName,
                agencyName,
                originalVol,
                originalClass,
                originalPrice,
                proposedVol,
                proposedClass,
                proposedPrice,
                notes
            });

            await this.sendEmail(
                customerEmail,
                emailSubject,
                emailBody,
                { html: true }
            );

            console.log(`📧 Contre-proposition envoyée à ${customerEmail} pour la réservation ${originalReservation.id}`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi de la contre-proposition au client:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Génère le template HTML pour la contre-proposition
     */
    static generateCounterProposalTemplate(data) {
        const {
            originalReservation,
            counterProposal,
            customerFirstName,
            customerLastName,
            agencyName,
            originalVol,
            originalClass,
            originalPrice,
            proposedVol,
            proposedClass,
            proposedPrice,
            notes
        } = data;

        // Calcul de la différence de prix
        const priceDifference = proposedPrice - originalPrice;
        const priceDifferenceFormatted = this.formatCurrency(Math.abs(priceDifference));
        const isPriceIncrease = priceDifference > 0;

        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouvelle Proposition de Vol</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; 
                    margin: 0;
                    min-height: 100vh;
                }
                .container { 
                    max-width: 800px; 
                    background: #fff; 
                    padding: 40px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    border-bottom: 3px solid #ff6b35;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #ff6b35; 
                    margin: 0;
                    font-size: 32px;
                }
                .proposal-badge {
                    background: #ff6b35;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    margin: 10px 0;
                }
                .comparison-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin: 30px 0;
                }
                .offer-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 10px;
                    border: 2px solid #ddd;
                    text-align: center;
                }
                .original-offer {
                    border-color: #6c757d;
                }
                .proposed-offer {
                    border-color: #28a745;
                    background: #e8f5e8;
                }
                .offer-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #333;
                }
                .price {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 15px 0;
                }
                .original-price {
                    color: #6c757d;
                    text-decoration: line-through;
                }
                .proposed-price {
                    color: #28a745;
                }
                .price-change {
                    background: ${isPriceIncrease ? '#fff3cd' : '#d4edda'};
                    color: ${isPriceIncrease ? '#856404' : '#155724'};
                    padding: 10px;
                    border-radius: 5px;
                    margin: 10px 0;
                    font-weight: bold;
                }
                .flight-details {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #007bff;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                }
                .detail-label {
                    font-weight: bold;
                    color: #555;
                    font-size: 14px;
                }
                .detail-value {
                    color: #333;
                    font-size: 16px;
                }
                .notes-section {
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                    border-left: 4px solid #ffc107;
                }
                .action-buttons {
                    text-align: center;
                    margin: 30px 0;
                }
                .btn {
                    display: inline-block;
                    background: #28a745;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 0 10px;
                    transition: background 0.3s;
                }
                .btn-accept {
                    background: #28a745;
                }
                .btn-reject {
                    background: #dc3545;
                }
                .btn-details {
                    background: #007bff;
                }
                .btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .footer { 
                    margin-top: 40px; 
                    font-size: 14px; 
                    text-align: center; 
                    color: #666;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .urgency-note {
                    background: #ffeaa7;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                    font-weight: bold;
                }
                @media (max-width: 768px) {
                    .comparison-section {
                        grid-template-columns: 1fr;
                    }
                    .container {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- En-tête -->
                <div class="header">
                    <h1>🎯 Nouvelle Proposition de Vol</h1>
                    <div class="proposal-badge">PROPOSITION SPÉCIALE</div>
                    <p>Votre agence vous fait une nouvelle proposition pour votre réservation</p>
                </div>

                <!-- Comparaison des offres -->
                <div class="comparison-section">
                    <!-- Offre originale -->
                    <div class="offer-card original-offer">
                        <div class="offer-title">Votre Demande Initiale</div>
                        <div class="price original-price">${this.formatCurrency(originalPrice)} XOF</div>
                        <div class="flight-info">
                            <p><strong>Vol:</strong> ${originalVol?.flight?.name || 'N/A'}</p>
                            <p><strong>Classe:</strong> ${originalClass?.name || 'N/A'}</p>
                            <p><strong>Départ:</strong> ${originalVol?.departureTime ? new Date(originalVol.departureTime).toLocaleString('fr-FR') : 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Offre proposée -->
                    <div class="offer-card proposed-offer">
                        <div class="offer-title">Nouvelle Proposition</div>
                        <div class="price proposed-price">${this.formatCurrency(proposedPrice)} XOF</div>
                        <div class="price-change">
                            ${isPriceIncrease ? 
                                `+${priceDifferenceFormatted} XOF` : 
                                `-${priceDifferenceFormatted} XOF`}
                            ${isPriceIncrease ? '(Augmentation)' : '(Économie)'}
                        </div>
                        <div class="flight-info">
                            <p><strong>Vol:</strong> ${proposedVol?.flight?.name || 'N/A'}</p>
                            <p><strong>Classe:</strong> ${proposedClass?.name || 'N/A'}</p>
                            <p><strong>Départ:</strong> ${proposedVol?.departureTime ? new Date(proposedVol.departureTime).toLocaleString('fr-FR') : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <!-- Détails du vol proposé -->
                <div class="flight-details">
                    <h3 style="color: #007bff; margin-top: 0;">✈️ Détails du Vol Proposé</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Compagnie:</span>
                            <span class="detail-value">${proposedVol?.flight?.companyVol?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Itinéraire:</span>
                            <span class="detail-value">
                                ${proposedVol?.flight?.origin?.name || 'N/A'} 
                                → 
                                ${proposedVol?.flight?.destination?.name || 'N/A'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Départ:</span>
                            <span class="detail-value">
                                ${proposedVol?.departureTime ? new Date(proposedVol.departureTime).toLocaleString('fr-FR') : 'N/A'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Arrivée:</span>
                            <span class="detail-value">
                                ${proposedVol?.arrivalTime ? new Date(proposedVol.arrivalTime).toLocaleString('fr-FR') : 'N/A'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Classe:</span>
                            <span class="detail-value">${proposedClass?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Multiplicateur:</span>
                            <span class="detail-value">x${proposedClass?.priceMultiplier || '1'}</span>
                        </div>
                    </div>
                </div>

                <!-- Notes de l'agence -->
                ${notes ? `
                <div class="notes-section">
                    <h3 style="color: #856404; margin-top: 0;">💬 Message de votre agence</h3>
                    <p>${notes}</p>
                </div>
                ` : ''}

                <!-- Note d'urgence -->
                <div class="urgency-note">
                    ⏰ Cette proposition est valable 48 heures. Veuillez répondre avant expiration.
                </div>

                <!-- Actions -->
                <div class="action-buttons">
                    <a href="${process.env.FRONTEND_URL}/reservations/${counterProposal.id}/accept" class="btn btn-accept">
                        ✅ Accepter la Proposition
                    </a>
                    <a href="${process.env.FRONTEND_URL}/reservations/${counterProposal.id}/reject" class="btn btn-reject">
                        ❌ Refuser la Proposition
                    </a>
                    <a href="${process.env.FRONTEND_URL}/reservations/${counterProposal.id}" class="btn btn-details">
                        📋 Voir les Détails
                    </a>
                </div>

                <!-- Informations de contact -->
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h4>📞 Questions ?</h4>
                    <p>Contactez votre agence <strong>${agencyName}</strong> pour plus d'informations.</p>
                </div>

                <div class="footer">
                    <p><strong>Merci de votre confiance !</strong></p>
                    <p>L'équipe ${agencyName}</p>
                    <p><em>Cet email a été généré automatiquement, merci de ne pas y répondre.</em></p>
                </div>
            </div>
        </body>
        </html>`;
    }

     static async sendReservationConfirmationToCustomer(reservation, invoice = null) {
        try {
            const customerEmail = reservation.customerReservation?.user?.email;
            const customerFirstName = reservation.customerReservation?.user?.firstName || "N/A";
            const customerLastName = reservation.customerReservation?.user?.lastName || "N/A";
            const agencyName = reservation.agencyReservations?.name || "N/A";
            const agencyAddress = reservation.agencyReservations?.address || "N/A";

            if (!customerEmail) {
                console.warn(`⚠️ Aucune adresse email client trouvée pour la réservation ${reservation.id}`);
                return { success: false, error: "Email client manquant" };
            }

            // Récupérer les détails du vol via FlightAgency
            let flightDetails = "N/A";
            let classDetails = "N/A";
            let departureTime = "N/A";
            let arrivalTime = "N/A";
            
            if (reservation.flightAgency) {
                const flightAgency = reservation.flightAgency;
                if (flightAgency.flight) {
                    const flight = flightAgency.flight;
                    flightDetails = `${flight.name} - ${flight.origin?.name || 'N/A'} → ${flight.destination?.name || 'N/A'}`;
                }
                
                // Récupérer la classe si disponible
                if (reservation.classId && flightAgency.Classes) {
                    const selectedClass = flightAgency.Classes.find(cls => cls.id === reservation.classId);
                    classDetails = selectedClass ? `${selectedClass.name}` : "N/A";
                }

                // Heures de départ et d'arrivée
                if (flightAgency.departureTime) {
                    departureTime = new Date(flightAgency.departureTime).toLocaleString('fr-FR');
                }
                if (flightAgency.arrivalTime) {
                    arrivalTime = new Date(flightAgency.arrivalTime).toLocaleString('fr-FR');
                }
            }

            const emailSubject = `✅ Confirmation de votre réservation `;
            const emailBody = this.generateReservationConfirmationTemplate({
                reservation,
                customerFirstName,
                customerLastName,
                agencyName,
                agencyAddress,
                flightDetails,
                classDetails,
                departureTime,
                arrivalTime,
                invoice
            });
                if (typeof emailBody !== 'string') {
            console.error('❌ Le contenu HTML doit être une string');
            emailBody = String(emailBody); // Convertir en string si nécessaire
        }
            await this.sendEmail(
                customerEmail,
                emailSubject,
                emailBody,
                { html: true }
            );

            console.log(`📧 Confirmation de réservation envoyée à ${customerEmail} pour la réservation ${reservation.id}`);
            return { success: true };

        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi de la confirmation au client pour la réservation ${reservation.id}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Génère le template HTML pour la confirmation de réservation
     */
    static generateReservationConfirmationTemplate(data) {
        const {
            reservation,
            customerFirstName,
            customerLastName,
            agencyName,
            agencyAddress,
            flightDetails,
            classDetails,
            departureTime,
            arrivalTime,
            invoice
        } = data;

        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation de Réservation</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px; 
                    margin: 0;
                    min-height: 100vh;
                }
                .container { 
                    max-width: 700px; 
                    background: #fff; 
                    padding: 40px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    border-bottom: 3px solid #28a745;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #28a745; 
                    margin: 0;
                    font-size: 32px;
                }
                .confirmation-badge {
                    background: #28a745;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    margin: 10px 0;
                }
                .section {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 10px;
                    margin-bottom: 25px;
                    border-left: 4px solid #007bff;
                }
                .section h3 {
                    color: #007bff;
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-top: 15px;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                .info-label {
                    font-weight: bold;
                    color: #555;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                .info-value {
                    color: #333;
                    font-size: 16px;
                    font-weight: 500;
                }
                .flight-card {
                    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border: 2px solid #2196f3;
                }
                .flight-route {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 15px 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                .flight-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                .invoice-section {
                    background: #e8f5e8;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                    border: 2px solid #4caf50;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    background: white;
                }
                .invoice-table th,
                .invoice-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                .invoice-table th {
                    background-color: #4caf50;
                    color: white;
                }
                .total-amount {
                    background: #4caf50;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 20px 0;
                    font-size: 20px;
                    font-weight: bold;
                }
                .next-steps {
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                    border-left: 4px solid #ffc107;
                }
                .steps-list {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                .steps-list li {
                    margin-bottom: 10px;
                }
                .action-buttons {
                    text-align: center;
                    margin: 30px 0;
                }
                .btn {
                    display: inline-block;
                    background: #28a745;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 0 10px;
                    transition: background 0.3s;
                }
                .btn:hover {
                    background: #218838;
                }
                .footer { 
                    margin-top: 40px; 
                    font-size: 14px; 
                    text-align: center; 
                    color: #666;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .contact-info {
                    background: #e7f3ff;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                }
                @media (max-width: 600px) {
                    .info-grid, .flight-details {
                        grid-template-columns: 1fr;
                    }
                    .container {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- En-tête de confirmation -->
                <div class="header">
                    <h1>🎉 Réservation Confirmée !</h1>
                    <div class="confirmation-badge">CONFIRMÉE</div>
                    <p>Votre réservation a été confirmée avec succès</p>
                </div>

                <!-- Référence de réservation -->
                <div class="section">
                    <h3>📋 Détails de la Réservation</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Référence:</span>
                            <span class="info-value"><strong>#${reservation.id}</strong></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Statut:</span>
                            <span class="info-value" style="color: #28a745; font-weight: bold;">Confirmée</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date de confirmation:</span>
                            <span class="info-value">${new Date().toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Type de voyage:</span>
                            <span class="info-value">${reservation.tripType || 'Aller simple'}</span>
                        </div>
                    </div>
                </div>

                <!-- Informations client -->
                <div class="section">
                    <h3>👤 Voyageur</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nom complet:</span>
                            <span class="info-value">${customerFirstName} ${customerLastName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${reservation.customerReservation?.user?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Détails du vol -->
                ${flightDetails !== 'N/A' ? `
                <div class="flight-card">
                    <h3 style="color: #2196f3; text-align: center; margin-top: 0;">✈️ Votre Vol</h3>
                    <div class="flight-route">
                        <span>${reservation.flightAgency?.flight?.origin?.name || 'Départ'}</span>
                        <span style="color: #2196f3;">→</span>
                        <span>${reservation.flightAgency?.flight?.destination?.name || 'Arrivée'}</span>
                    </div>
                    <div class="flight-details">
                        <div class="info-item">
                            <span class="info-label">Compagnie:</span>
                            <span class="info-value">${reservation.flightAgency?.flight?.companyVol?.name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Classe:</span>
                            <span class="info-value">${classDetails}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Départ:</span>
                            <span class="info-value">${departureTime}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Arrivée:</span>
                            <span class="info-value">${arrivalTime}</span>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Informations agence -->
                <div class="section">
                    <h3>🏢 Votre Agence</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nom:</span>
                            <span class="info-value">${agencyName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Adresse:</span>
                            <span class="info-value">${agencyAddress}</span>
                        </div>
                    </div>
                </div>

                <!-- Facture -->
                ${invoice ? `
                <div class="invoice-section">
                    <h3 style="color: #4caf50;">💰 Facture</h3>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Description</th>
                                <th>Montant (XOF)</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${invoice.reference}</td>
                                <td>Réservation de vol</td>
                                <td>${this.formatCurrency(invoice.amount)}</td>
                                <td style="color: #28a745; font-weight: bold;">Confirmé</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="total-amount">
                        Total Payé: ${this.formatCurrency(invoice.amount)} XOF
                    </div>
                </div>
                ` : ''}

                <!-- Prochaines étapes -->
                <div class="next-steps">
                    <h3>📝 Prochaines Étapes</h3>
                    <ul class="steps-list">
                        <li><strong>Présentez-vous</strong> à l'aéroport 2 heures avant le décollage</li>
                        <li><strong>Ayez avec vous</strong> votre pièce d'identité et ce document de confirmation</li>
                        <li><strong>Vérifiez</strong> les horaires de vol 24h avant le départ</li>
                        <li><strong>Contactez l'agence</strong> en cas de question ou modification</li>
                    </ul>
                </div>

                <!-- Informations de contact -->
                <div class="contact-info">
                    <h4>📞 Contactez votre agence</h4>
                    <p>Pour toute question concernant votre réservation, contactez ${agencyName}</p>
                    <p>Adresse: ${agencyAddress}</p>
                </div>

                <!-- Actions -->
                <div class="action-buttons">
                    <a href="${process.env.FRONTEND_URL}/mes-reservations/${reservation.id}" class="btn">
                        📋 Voir ma réservation
                    </a>
                    <a href="${process.env.FRONTEND_URL}/contact" class="btn" style="background: #6c757d;">
                        📞 Nous contacter
                    </a>
                </div>

                <div class="footer">
                    <p><strong>Merci d'avoir choisi ${agencyName} !</strong></p>
                    <p>Bon voyage et à bientôt ! ✈️</p>
                    <p><em>Cet email a été généré automatiquement, merci de ne pas y répondre.</em></p>
                </div>
            </div>
        </body>
        </html>`;
    }
static formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
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
   /**
     * Génère le template HTML pour la réponse du client
     */
    static generateProposalResponseTemplate(data) {
        const {
            proposal,
            originalReservation,
            responseType,
            rejectionReason,
            customerName,
            customerEmail,
            agency
        } = data;

        const isAccepted = responseType === 'accepted';
        const mainColor = isAccepted ? '#28a745' : '#dc3545';
        const icon = isAccepted ? '✅' : '❌';
        const statusText = isAccepted ? 'Acceptée' : 'Refusée';
        const actionRequired = isAccepted ? 'Confirmer la réservation' : 'Proposer une nouvelle offre';

        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réponse du Client</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    background: linear-gradient(135deg, ${isAccepted ? '#667eea' : '#e66465'} 0%, ${isAccepted ? '#764ba2' : '#9198e5'} 100%);
                    padding: 20px; 
                    margin: 0;
                    min-height: 100vh;
                }
                .container { 
                    max-width: 800px; 
                    background: #fff; 
                    padding: 40px; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    border-bottom: 3px solid ${mainColor};
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: ${mainColor}; 
                    margin: 0;
                    font-size: 32px;
                }
                .status-badge {
                    background: ${mainColor};
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;
                    margin: 10px 0;
                }
                .response-section {
                    background: ${isAccepted ? '#e8f5e8' : '#f8d7da'};
                    padding: 25px;
                    border-radius: 10px;
                    margin: 25px 0;
                    border-left: 4px solid ${mainColor};
                }
                .client-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .proposal-details {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                    border: 2px solid #007bff;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                }
                .detail-label {
                    font-weight: bold;
                    color: #555;
                    font-size: 14px;
                }
                .detail-value {
                    color: #333;
                    font-size: 16px;
                }
                .rejection-reason {
                    background: #fff3cd;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #ffc107;
                }
                .action-required {
                    background: ${isAccepted ? '#d4edda' : '#f8d7da'};
                    color: ${isAccepted ? '#155724' : '#721c24'};
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                    text-align: center;
                    font-weight: bold;
                    border: 2px solid ${mainColor};
                }
                .action-buttons {
                    text-align: center;
                    margin: 30px 0;
                }
                .btn {
                    display: inline-block;
                    background: ${mainColor};
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 0 10px;
                    transition: all 0.3s;
                }
                .btn:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                .footer { 
                    margin-top: 40px; 
                    font-size: 14px; 
                    text-align: center; 
                    color: #666;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .timeline {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .timeline-item {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    padding: 10px;
                    background: white;
                    border-radius: 5px;
                    border-left: 4px solid #007bff;
                }
                .timeline-icon {
                    font-size: 20px;
                    margin-right: 15px;
                }
                @media (max-width: 768px) {
                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                    .container {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- En-tête -->
                <div class="header">
                    <h1>${icon} Réponse du Client</h1>
                    <div class="status-badge">PROPOSITION ${statusText}</div>
                    <p>Le client a répondu à votre contre-proposition</p>
                </div>

                <!-- Section réponse -->
                <div class="response-section">
                    <h3 style="color: ${mainColor}; margin-top: 0;">
                        ${isAccepted ? '🎉 Félicitations ! Votre proposition a été acceptée' : '📝 Le client a refusé votre proposition'}
                    </h3>
                    
                    <div class="client-info">
                        <h4>👤 Informations du Client</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Nom:</span>
                                <span class="detail-value">${customerName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${customerEmail}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Date de réponse:</span>
                                <span class="detail-value">${new Date().toLocaleString('fr-FR')}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Référence:</span>
                                <span class="detail-value">#${proposal.id}</span>
                            </div>
                        </div>
                    </div>

                    ${!isAccepted && rejectionReason ? `
                    <div class="rejection-reason">
                        <h4 style="color: #856404; margin-top: 0;">💬 Raison du refus</h4>
                        <p><em>"${rejectionReason}"</em></p>
                    </div>
                    ` : ''}
                </div>

                <!-- Détails de la proposition -->
                <div class="proposal-details">
                    <h3 style="color: #007bff; margin-top: 0;">📋 Détails de la Proposition</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Prix proposé:</span>
                            <span class="detail-value">${this.formatCurrency(proposal.totalPrice)} XOF</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Vol:</span>
                            <span class="detail-value">${proposal.vols?.flight?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Classe:</span>
                            <span class="detail-value">${proposal.class?.name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Itinéraire:</span>
                            <span class="detail-value">
                                ${proposal.vols?.flight?.origin?.name || 'N/A'} → 
                                ${proposal.vols?.flight?.destination?.name || 'N/A'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date de départ:</span>
                            <span class="detail-value">
                                ${proposal.vols?.departureTime ? new Date(proposal.vols.departureTime).toLocaleString('fr-FR') : 'N/A'}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Demande originale:</span>
                            <span class="detail-value">#${originalReservation.id}</span>
                        </div>
                    </div>
                </div>

                <!-- Timeline du processus -->
                <div class="timeline">
                    <h4>📅 Chronologie</h4>
                    <div class="timeline-item">
                        <span class="timeline-icon">📝</span>
                        <div>
                            <strong>Demande initiale créée</strong>
                            <br>${new Date(originalReservation.createdAt).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-icon">💼</span>
                        <div>
                            <strong>Contre-proposition envoyée</strong>
                            <br>${new Date(proposal.createdAt).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-icon">${isAccepted ? '✅' : '❌'}</span>
                        <div>
                            <strong>Réponse du client: ${statusText}</strong>
                            <br>${new Date().toLocaleString('fr-FR')}
                        </div>
                    </div>
                </div>

                <!-- Action requise -->
                <div class="action-required">
                    <h3 style="margin-top: 0;">🚀 Action Requise</h3>
                    <p>${isAccepted 
                        ? 'Veuillez procéder à la confirmation définitive de la réservation dans les plus brefs délais.' 
                        : 'Vous pouvez proposer une nouvelle contre-proposition ou contacter le client pour discuter des alternatives.'}
                    </p>
                </div>

                <!-- Boutons d'action -->
                <div class="action-buttons">
                    ${isAccepted ? `
                    <a href="${process.env.FRONTEND_URL}/admin/reservations/${proposal.id}/confirm" class="btn">
                        ✅ Confirmer la Réservation
                    </a>
                    ` : `
                    <a href="${process.env.FRONTEND_URL}/admin/reservations/${originalReservation.id}/new-proposal" class="btn">
                        💼 Nouvelle Proposition
                    </a>
                    `}
                    <a href="${process.env.FRONTEND_URL}/admin/reservations/${proposal.id}" class="btn" style="background: #007bff;">
                        📋 Voir les Détails
                    </a>
                    <a href="${process.env.FRONTEND_URL}/admin/customers/${originalReservation.customerId}" class="btn" style="background: #6c757d;">
                        👤 Profil Client
                    </a>
                </div>

                <div class="footer">
                    <p><strong>${agency.name}</strong></p>
                    <p>Cet email a été généré automatiquement par le système de réservation.</p>
                    <p><em>Merci de ne pas répondre à cet email.</em></p>
                </div>
            </div>
        </body>
        </html>`;
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
     static async sendNewReservationToAgency(reservation) {
        try {
            // Récupérer les informations de l'agence
            const agency = await Agency.findByPk(reservation.agencyId, {
                include: [
                    { 
                        model: User, 
                        as: 'User',
                        attributes: ['id', 'firstName', 'lastName', 'email'] 
                    },
                    {
                        model: User,
                        as: 'assignedUsers',
                        through: { attributes: [] },
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }
                ]
            });

            if (!agency) {
                console.warn(`⚠️ Agence introuvable pour la réservation ${reservation.id}`);
                return { success: false, error: "Agence introuvable" };
            }

            // Récupérer les informations du client
            const customer = await Customer.findByPk(reservation.customerId, {
                include: [
                    { 
                        model: User, 
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] 
                    }
                ]
            });

            if (!customer) {
                console.warn(`⚠️ Client introuvable pour la réservation ${reservation.id}`);
                return { success: false, error: "Client introuvable" };
            }

            // Récupérer les détails du vol
            let flightDetails = null;
            if (reservation.agencyVolId) {
                flightDetails = await AgencyFlights.findOne({
                    where: { id: reservation.agencyVolId },
                    include: [
                        {
                            model: Vol,
                            as: 'flight',
                            include: [
                                {
                                    model: Destination,
                                    as: 'origin',
                                    attributes: ['id', 'name', 'code']
                                },
                                {
                                    model: Destination,
                                    as: 'destination',
                                    attributes: ['id', 'name', 'code']
                                },
                                {
                                    model: Company,
                                    as: 'companyVol',
                                    attributes: ['id', 'name']
                                }
                            ]
                        },
                        {
                            model: Class,
                            as: 'Classes',
                            where: { id: reservation.agencyClassId },
                            required: false
                        }
                    ]
                });
            }

            // Récupérer les détails de la campagne
            let campaignDetails = null;
            if (reservation.campaignId) {
                campaignDetails = await Campaign.findByPk(reservation.campaignId, {
                    attributes: ['id', 'name', 'price', 'description']
                });
            }

            // Récupérer les passagers
            const passengers = await Passenger.findAll({
                where: { reservationId: reservation.id },
                attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender']
            });

            // Déterminer les destinataires de l'email
            const recipients = this.getAgencyRecipients(agency);
            if (recipients.length === 0) {
                console.warn(`⚠️ Aucun email trouvé pour l'agence ${agency.name}`);
                return { success: false, error: "Aucun email d'agence trouvé" };
            }

            const emailSubject = `🎫 Nouvelle Réservation - ${reservation.id}`;
            const emailBody = this.generateNewReservationTemplate({
                reservation,
                agency,
                customer,
                flightDetails,
                campaignDetails,
                passengers
            });

            // Envoyer l'email à tous les destinataires de l'agence
            let sentCount = 0;
            for (const recipient of recipients) {
                try {
                    await this.sendEmail(
                        recipient,
                        emailSubject,
                        emailBody,
                        { html: true }
                    );
                    console.log(`📧 Notification envoyée à ${recipient} pour la nouvelle réservation ${reservation.id}`);
                    sentCount++;
                } catch (emailError) {
                    console.error(`❌ Erreur envoi email à ${recipient}:`, emailError.message);
                }
            }

            return { 
                success: sentCount > 0, 
                recipients: recipients.length,
                sent: sentCount
            };

        } catch (error) {
            console.error(`❌ Erreur lors de l'envoi de la notification à l'agence pour la réservation ${reservation.id}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Récupère tous les emails de l'agence
     */
    static getAgencyRecipients(agency) {
        const recipients = new Set();

        // Email principal de l'agence
        if (agency.User?.email) {
            recipients.add(agency.User.email);
        }

        // Utilisateurs assignés à l'agence
        if (agency.assignedUsers && agency.assignedUsers.length > 0) {
            agency.assignedUsers.forEach(user => {
                if (user.email) {
                    recipients.add(user.email);
                }
            });
        }

        return Array.from(recipients);
    }

    /**
     * Génère le template HTML pour la notification de nouvelle réservation
     */
    static generateNewReservationTemplate(data) {
        const { reservation, agency, customer, flightDetails, campaignDetails, passengers } = data;

        return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nouvelle Réservation</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    background-color: #f8f9fa; 
                    padding: 20px; 
                    margin: 0;
                    color: #333;
                }
                .container { 
                    max-width: 800px; 
                    background: #fff; 
                    padding: 40px; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 40px; 
                    border-bottom: 3px solid #28a745;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #28a745; 
                    margin: 0;
                    font-size: 32px;
                }
                .badge {
                    background: #28a745;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                }
                .section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    border-left: 4px solid #007bff;
                }
                .section h3 {
                    color: #007bff;
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 15px;
                }
                .info-item {
                    display: flex;
                    flex-direction: column;
                }
                .info-label {
                    font-weight: bold;
                    color: #555;
                    font-size: 14px;
                }
                .info-value {
                    color: #333;
                    font-size: 16px;
                }
                .passengers-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    background: white;
                }
                .passengers-table th,
                .passengers-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                .passengers-table th {
                    background-color: #007bff;
                    color: white;
                }
                .total-price {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 25px 0;
                    border: 2px solid #007bff;
                }
                .total-price h3 {
                    margin: 0;
                    color: #007bff;
                    font-size: 24px;
                }
                .action-buttons {
                    text-align: center;
                    margin: 30px 0;
                }
                .btn {
                    display: inline-block;
                    background: #28a745;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 0 10px;
                }
                .btn-secondary {
                    background: #6c757d;
                }
                .footer { 
                    margin-top: 40px; 
                    font-size: 14px; 
                    text-align: center; 
                    color: #666;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .highlight {
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid #ffc107;
                    margin: 20px 0;
                }
                @media (max-width: 600px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    .container {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎫 Nouvelle Réservation</h1>
                    <p>Une nouvelle réservation a été effectuée sur votre plateforme</p>
                    <div class="badge">RÉF: ${reservation.id}</div>
                </div>

                <!-- Informations de la réservation -->
                <div class="section">
                    <h3>📋 Détails de la Réservation</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Référence:</span>
                            <span class="info-value"><strong>${reservation.id}</strong></span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Statut:</span>
                            <span class="info-value" style="color: #dc3545; font-weight: bold;">${reservation.status}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date de création:</span>
                            <span class="info-value">${new Date(reservation.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Type de voyage:</span>
                            <span class="info-value">${reservation.tripType || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <!-- Informations du client -->
                <div class="section">
                    <h3>👤 Informations du Client</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nom complet:</span>
                            <span class="info-value">${customer.user.firstName} ${customer.user.lastName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${customer.user.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Téléphone:</span>
                            <span class="info-value">${customer.user.phone || 'Non renseigné'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">ID Client:</span>
                            <span class="info-value">${customer.id}</span>
                        </div>
                    </div>
                </div>

                ${flightDetails ? `
                <!-- Détails du vol -->
                <div class="section">
                    <h3>✈️ Détails du Vol</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Compagnie:</span>
                            <span class="info-value">${flightDetails.flight.companyVol?.name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Itinéraire:</span>
                            <span class="info-value">${flightDetails.flight.origin?.name || 'N/A'} → ${flightDetails.flight.destination?.name || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date de départ:</span>
                            <span class="info-value">${new Date(reservation.startAt).toLocaleString('fr-FR')}</span>
                        </div>
                        ${flightDetails.Classes && flightDetails.Classes.length > 0 ? `
                        <div class="info-item">
                            <span class="info-label">Classe:</span>
                            <span class="info-value">${flightDetails.Classes[0].name} (x${flightDetails.Classes[0].priceMultiplier})</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                ${campaignDetails ? `
                <!-- Détails de la campagne -->
                <div class="section">
                    <h3>🎯 Campagne</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nom:</span>
                            <span class="info-value">${campaignDetails.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Prix campagne:</span>
                            <span class="info-value">${this.formatCurrency(campaignDetails.price)} XOF</span>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Liste des passagers -->
                ${passengers && passengers.length > 0 ? `
                <div class="section">
                    <h3>👥 Passagers (${passengers.length})</h3>
                    <table class="passengers-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Date de naissance</th>
                                <th>Genre</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${passengers.map(passenger => `
                                <tr>
                                    <td>${passenger.lastName}</td>
                                    <td>${passenger.firstName}</td>
                                    <td>${passenger.dateOfBirth ? new Date(passenger.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</td>
                                    <td>${passenger.gender || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Prix total -->
                <div class="total-price">
                    <h3>💰 Prix Total: ${this.formatCurrency(reservation.totalPrice)} XOF</h3>
                </div>

                <!-- Actions -->
                <div class="highlight">
                    <p><strong>⏰ Action Requise:</strong> Cette réservation est en attente de confirmation. Veuillez la traiter dans les plus brefs délais.</p>
                </div>

                <div class="action-buttons">
                    <a href="${process.env.FRONTEND_URL}/admin/reservations/${reservation.id}" class="btn">
                        📋 Voir la Réservation
                    </a>
                    <a href="${process.env.FRONTEND_URL}/admin/reservations" class="btn btn-secondary">
                        🗂️ Toutes les Réservations
                    </a>
                </div>

                <div class="footer">
                    <p><strong>${agency.name}</strong> - Cet email a été généré automatiquement par le système de réservation.</p>
                    <p>Merci de ne pas répondre à cet email.</p>
                </div>
            </div>
        </body>
        </html>`;
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
