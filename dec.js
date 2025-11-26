// app.js (o index.js)
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(morgan('dev'));

const allowedOrigins = [
    "http://localhost:4200",
    "https://pasteleria-tony.vercel.app"
];

const corsOptions = {
    origin: function(origin, callback) {
        // origin === undefined when the request is from curl/postman or same-origin non-browser requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: origin not allowed: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true // poner true solo si necesitas cookies/credenciales desde el cliente
};

// aplica CORS globalmente
app.use(cors(corsOptions));
// asegúrate de responder a preflight OPTIONS con CORS también
app.options('*', cors(corsOptions));

app.use('/uploads', express.static('uploads'));
app.use(express.json());

// tus rutas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/upload', upload);
app.use('/config', configSistem);
app.use('/orders', orders);

// manejo 404
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: { message: error.message }
    });
});

module.exports = app;