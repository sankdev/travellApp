require('dotenv').config();
const Brevo = require('sib-api-v3-sdk');

async function sendTestSMS() {
  try {
    // Configuration de l'API Brevo
    const client = Brevo.ApiClient.instance;
    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const smsApi = new Brevo.TransactionalSMSApi();

    // Données du SMS
    const smsData = {
      sender: "YourBrand",  // Personnalisez votre nom d'expéditeur (configurable sur Brevo)
      recipient: process.env.TEST_PHONE_NUMBER, // Numéro de test au format international
      content: "Ceci est un test d'envoi de SMS avec Brevo via Node.js 🚀",
    };

    // Envoi du SMS
    const response = await smsApi.sendTransacSms(smsData);
    console.log("✅ SMS envoyé avec succès :", response);
  } catch (error) {
    console.error("❌ Erreur d'envoi du SMS :", error);
  }
}

// Exécuter le test
sendTestSMS();
