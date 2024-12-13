const{Sequelize}  = require('sequelize');

// Créer une instance Sequelize pour la connexion à la base de données PostgreSQL
const db = new Sequelize('travelApp', 'SIG_BAM', '123456', {
  host: 'localhost',
  port:'5432',
  dialect: 'postgres',

  
});
db
  .authenticate()
  
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
  db
  .sync() 
  .then(() => {
    console.log('Models synchronized with the database.');
  })
  .catch((error) => {
    console.error('Unable to sync models with the database:', error);
  });
module.exports = db;
