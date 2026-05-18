require('dotenv').config(); // Chargement des variables d'environnement
const express = require('express');
const db = require('./config/bd');
const cors = require('cors');
const path = require('path');
const app = express();
const sequelize = require('./config/bd');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const bodyParser=require('body-parser')
const multer=require('./middleware/uploadMiddleware')

// Routes
const agency = require('./routes/agenceRoute');
const customer = require('./routes/customerRoute');
const userRole = require('./routes/userRoleRoute');
const user = require('./routes/userRoute');
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
const flight = require('./routes/flightRoute'); // Import the flight route
const Flights=require('./routes/flightRoutesApi')
const agencyClass=require('./routes/agencyAssociationsRoutes')
const pricinRule=require('./routes/pricingRuleRoute')
const rolePermission = require('./routes/rolePermissionRoute'); // Import the role permission route
// Middlewares globaux
const userAgencyRoute=require('./routes/UserAgencyRoute')
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

app.set("trust proxy", true);

// Configuration des middlewares
app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); // Pour form-urlencoded


const corsOptions = {
  origin: "*", // Retire les chemins spécifiques
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"], // Tableau au lieu de chaîne
//  credentials: true,
};

app.use(cors(corsOptions));

// Middleware pour gérer les requêtes préflight OPTIONS
app.options("*", cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Déclaration des routes
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
app.use('/api/passenger', passenger);
app.use('/uploads', express.static('uploads'));
app.use('/api/image', image);
app.use('/api/flights', flight); // Use the flight route
app.use('/apis/flights', Flights); // Use the flight route 
app.use('/api', agencyClass);
app.use('/api/pricing-rules',pricinRule)
app.use('/api/role-permissions', rolePermission); // Use the role permission route
app.use('/api/userAgency',userAgencyRoute)
// Gestion des routes non trouvées
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Gestionnaire d'erreurs global
app.use(globalErrorHandler);

// Synchronisation avec la base de données et démarrage du serveur
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter:true}).then(() => {
  app.listen(5000, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
  console.error(err.stack);
});
