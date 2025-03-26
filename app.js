const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routers = require('./routes');
const dbConnect = require('./config/mongo.js');

const app = express();

app.use(express.json()); 

app.use(cors());

app.use((req, res, next) => {
    console.log("Cuerpo de la solicitud:", req.body);  
    next();
});

app.use('/api', routers); 

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

dbConnect();
