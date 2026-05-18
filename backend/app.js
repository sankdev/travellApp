//const express = require('express');//
//const cors = require('cors');
//const morgan = require('morgan');
//const rateLimit = require('express-rate-limit');
//const helmet = require('helmet');
//const xss = require('xss-clean');
//const hpp = require('hpp');

//const AppError = require('./utils/appError');
//const globalErrorHandler = require('./controllers/errorController');

// Import des routes
//const userRoutes = require('./routes/userRoutes');
//const agencyRoutes = require('./routes/agenceRoute');
//const destinationRoutes = require('./routes/destinationRoutes');
//const reservationRoutes = require('./routes/reservationRoutes');
//const invoiceRoutes = require('./routes/invoiceRoutes');
//const paymentRoutes = require('./routes/paymentRoutes');

//const app = express();

// Middleware de sécurité
//app.use(helmet());
//app.use(cors());

// Logging en développement
//if (process.env.NODE_ENV === 'development') {
  //  app.use(morgan('dev'));
//}

// Limite de requêtes par IP
//const limiter = rateLimit({
//    max: 100, // 100 requêtes par IP
  //  windowMs: 60 * 60 * 1000, // par heure
    //message: 'Too many requests from this IP, please try again in an hour!'
//});
//app.use('/api', limiter);

// Body parser
//app.use(express.json({ limit: '10kb' }));
//app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Protection contre XSS et paramètre pollution
//app.use(xss());
//app.use(hpp());

// Routes
//app.use('/api/users', userRoutes);
//app.use('/api/agencies', agencyRoutes);
//app.use('/api/destinations', destinationRoutes);
//app.use('/api/reservations', reservationRoutes);
//app.use('/api/invoices', invoiceRoutes);
//app.use('/api/payments', paymentRoutes);

// Gestion des routes non trouvées
//app.all('*', (req, res, next) => {
  //  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
//});

// Gestionnaire d'erreurs global
//app.use(globalErrorHandler);

//module.exports = app;
