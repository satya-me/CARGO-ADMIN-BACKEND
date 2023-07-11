const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

require('dotenv').config();

const app = express();

app.use('/public', express.static("public"));
// app.use(express.static('public'));

// cookie session
app.use(session({
    cookie: { maxAge: 60000 },
    secret: "kotai_electronics_pvt_ltd",
    resave: false,
    saveUninitialized: false
}));

// cookieParser
app.use(cookieParser());

// bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// views
app.set("view engine", "ejs");
app.set("views", "views");

// cros
app.use(cors());

const targetUrl = process.env.HOST;

// Create a proxy for the file server
const fileProxy = createProxyMiddleware('/public', {
    target: targetUrl,
    changeOrigin: true,
});

// Proxy the request to the file server
app.use('/public', fileProxy);

// adminRoute
const adminRoute = require('./routes/adminRoute');
app.use('/api', adminRoute);

// airlineRoute
const airlineRoute = require('./routes/airlineRoute');
app.use('/api/system', airlineRoute);

// vendorRoute
const vendorRoute = require('./routes/vendorRoute');
app.use('/api', vendorRoute);

// bookingRoute
const bookingRoute = require('./routes/bookingRoute');
app.use('/api', bookingRoute);


// dotenv config
require('dotenv').config();

// mongoose Connection
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(res => app.listen(process.env.PORT || 3304, () => console.log(`Server Running at ${process.env.HOST}`), console.log("*****DATABASE CONNECTED*****")))
    .catch(err => console.log(err))