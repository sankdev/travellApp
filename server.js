const express = require('express');
const cors =require('cors')
const path = require('path');
const app = express();
const agency=require('./routes/agenceRoute')
const Customer=require('./routes/customerRoute')
const UserRole=require('./routes/userRoleRoute')
const User=require('./routes/userRoute')
const Permission=require('./routes/permissionRoute')
const Destination=require('./routes/destinationRoutes')
const Visa =require('./routes/visasRoute');
const Company=require('./routes/companyRoute')
const campaign=require('./routes/campaignRoute')
const  Vol=require('./routes/VolRoute')
const Class=require('./routes/routesClass')
// const Role = require('./routes/roleRoute');
const Role=require('./routes/roleRoute')

app.use(express.json());
app.use(cors()) 

app.use('/agency',agency)
app.use('/customer',Customer)
app.use('/user',User)
app.use('/destination',Destination)
app.use('/roleUser',UserRole)
app.use('/visa',Visa)
app.use('/role',Role)
app.use('/permission',Permission)
app.use('/company',Company)
app.use('/campaign',campaign)
app.use('/vol',Vol)
app.use('/class',Class)







const PORT = process.env.PORT || 5000;  

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});