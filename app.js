const express = require('express');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")
const morganBody = require("morgan-body");

require('dotenv').config();

const routers = require('./routes');
const dbConnect = require('./config/mongo.js');
const loggerStream = require("./utils/handleLogger");

const app = express();

app.use(express.json()); 

app.use(cors());

app.use((req, res, next) => {
    //console.log("Cuerpo de la solicitud:", req.body);  
    next();
});

morganBody(app, {
    noColors: true,
    skip: function (req, res) {
        return res.statusCode < 500;
    },
    stream: loggerStream
});

app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)

app.use('/api', routers); 

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
});

module.exports = { app, server};
dbConnect();