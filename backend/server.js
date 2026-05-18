require('dotenv').config(); // Chargement des variables d'environnement

// Importation des modules
const express = require('express');
const cors = require('cors');
const path = require('path');
//const morgan = require('morgan');
//const winston=require('winston')
//const rateLimit = require('express-rate-limit');
//const helmet = require('helmet');
//const xss = require('xss-clean');
//const hpp = require('hpp');
const bodyParser = require('body-parser');
//const AppError = require('./utils/appError');
//const globalErrorHandler = require('./controllers/errorController');
const sequelize = require('./config/bd'); // Importation unique de la DB

// Initialisation de l'application
const app = express();
//app.use(express.json({limit:'50mb'})); // Pour parser les requêtes JSON
//app.use(express.urlencoded({ extended: true }));
//app.use(bodyParser.urlencoded({ extended: true })); // Pour form-urlencoded

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  };
app.use(cors(corsOptions));








// Conditionner express.json à application/json uniquement

// 👉 Empêcher express.json de parser multipart/form-data
// Middleware conditionnel pour parser selon Content-Type
//app.use((req, res, next) => {
 // const contentType = req.headers['content-type'] || '';
 // if (contentType.includes('multipart/form-data')) {
  //  next(); // laisser multer gérer
 // } else if (contentType.includes('application/json')) {
  //  express.json({limit:'50mb'})(req, res, next);
//  } else if (contentType.includes('application/x-www-form-urlencoded')) {
//    express.urlencoded({ extended: true,limit:'50mb'})(req, res, next);
//  } else {
//    next();
 // }
//});

app.use((req, res, next) => {
  console.log('↪ Method:', req.method);
  console.log('↪ URL:', req.originalUrl);
  console.log('↪ Content-Type:', req.headers['content-type']);
  next();
});

app.use(express.json({limit:'50mb'}));



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Importation des routes
const agency = require('./routes/agenceRoute');
const customer = require('./routes/customerRoute');
const userRole = require('./routes/userRoleRoute');
const user = require('./routes/userRoute');
const Notification=require('./routes/notificationRoute')
const permission = require('./routes/permissionRoute');
const destination = require('./routes/destinationRoutes');
const visa = require('./routes/visasRoute');
const company = require('./routes/companyRoute');
const campaign = require('./routes/campaignRoute');
const vol = require('./routes/VolRoute');
const routeClass = require('./routes/routesClass');
const role = require('./routes/roleRoute');
const payment = require('./routes/paymentRoutes');
const paymentMode = require('./routes/paymentModeRoute');
const passenger = require('./routes/passengerRoute');
const invoice = require('./routes/invoiceRoutes');
const image = require('./routes/ImageRoute');
const reservation = require('./routes/reservationRoutes');
//const reservationHistory=require('./routes/reservationHistoryRoute')
const flight = require('./routes/flightRoute');
const Flights = require('./routes/flightRoutesApi');
const agencyClass = require('./routes/agencyAssociationsRoutes');
const pricingRule = require('./routes/pricingRuleRoute');
const rolePermission = require('./routes/rolePermissionRoute');
const userAgencyRoute = require('./routes/UserAgencyRoute');
const reservationHistory=require("./routes/reservationHistoryRoute")
//const app = express();



// Déclaration des routes
app.use('/api/reservationHistory',reservationHistory)
app.use('/api/reservations', reservation);
app.use('/api/agency', agency);
app.use('/api/customer', customer);
app.use('/api/user', user);
app.use('/api/destinations', destination);
app.use('/api/roleUser', userRole);
app.use('/api/visa', visa);
app.use('/api/role', role);
app.use('/api/permissions', permission);
app.use('/api/company', company);
app.use('/api/campaign', campaign);
app.use('/api/vols', vol);
app.use('/api/classes', routeClass);
app.use('/api/invoice', invoice);
app.use('/api/payment', payment);
app.use('/api/paymentMode', paymentMode);
// Ajoutez cette ligne après les autres routes
app.use('/api/v1/notifications', Notification);
//app.use('/api/history',reservationHistory)
app.use('/api/passenger', passenger);
app.use('/api/image', image);
app.use('/api/flights', flight);
app.use('/api/flights', Flights);
app.use('/api/agencyAssociation', agencyClass);
app.use('/api/pricing-rules', pricingRule);
app.use('/api/role-permissions', rolePermission);
app.use('/api/userAgency', userAgencyRoute);


// Gestion des routes non trouvées
app.get("/", (req, res) => {
  res.status(200).send("🚀 Serveur opérationnel !");
});

// 🧯 Gestion des erre
// Démarrage du serveur
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Impossible de se connecter à la base de données :", err);
  }
})();
