const express = require('express');
// const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();


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


// cros
app.use(cors());


// adminRoute
const adminRoute = require('./routes/adminRoute');
app.use('/api', adminRoute);

// airlineRoute
const airlineRoute = require('./routes/airlineRoute');
app.use('/api/system', airlineRoute);


// // Define a route for setting the cookie
// app.get('/set-cookie', (req, res) => {
//     // Set the cookie using the `res.cookie()` method
//     res.cookie('cookieName', 'cookieValue', {
//         maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (in milliseconds)
//         httpOnly: true, // Restrict cookie access to HTTP(S) requests
//     });

//     res.send('Cookie set successfully!');
// });


// dotenv config
require('dotenv').config();

// mongoose Connection
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(res => app.listen(process.env.PORT || 3304, () => console.log(`Server Running at ${process.env.HOST}`), console.log("*****DATABASE CONNECTED*****")))
    .catch(err => console.log(err))