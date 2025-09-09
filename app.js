const express = require('express');
const app = express();
require('dotenv').config()
const morgan = require('morgan');
const mongoose = require('mongoose');
function logRequest(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
}
const productRoutes = require('./api/routes/Product');
const authRoutes = require('./api/routes/auth');

const userRoutes = require('./api/routes/userRoutes');
const upload = require('./api/routes/upload.router');
const orders = require('./api/routes/orders');
const configSistem = require('./api/routes/config.routes');

const url =
    'mongodb+srv://20211036:' +  process.env.MONGO_ATLAS_PW   + '@cluster0.jcf0o.mongodb.net/pasteleria';
mongoose.connect(url).then(() => {
    console.log('Conexión ak MongoDB exitosa');
})
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err.message);
    });
mongoose.Promise = global.Promise;

app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({})
    }
    next();
});

app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/upload', upload);
app.use('/config', configSistem);
app.use('/orders', orders);

app.use((req, res, next) => {
    const error = new Error(' corriendo ...');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});
module.exports = app;