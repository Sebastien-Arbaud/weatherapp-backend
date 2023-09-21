const mongoose = require('mongoose');

//Connexion à notre base de donnée MongoDB grâce à la connexion string stockée dans le fichier .env

const connectionString = process.env.CONNECTION_STRING;


mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error(error));
