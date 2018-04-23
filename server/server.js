const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./routes/routes');
const mysql = require('mysql');
const passport = require('passport');
const strategy = require('./passport/passport');
passport.use(strategy);

// setting up the app
const app = express();
const port = process.env.port || 8000;

// setting up the view using ejs templating engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// setting up all the middlewares
app.use(passport.initialize());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use('/', routes);


app.listen(port, () => {
    console.log(`listening at port ${ port }`);
});