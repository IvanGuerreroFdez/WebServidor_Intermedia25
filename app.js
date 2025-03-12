const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routers = require('./routes'); 
const dbConnect = require('./config/mongo.js'); 
const errorHandler = require('./middleware/errorHandler'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api', routers);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

dbConnect();
