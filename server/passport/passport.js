const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

let model = require('./../models/models');
let sequelize = model.sequelize;
let Admin = model.Admin;

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'secret';

// define the strategy
// this strategy will be used in the middleware function
let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
    Admin.find({
        where: {
            id: jwt_payload.id    // find a user with the given id decoded from the token
        }
    }).then((result, err) => {
    
            if (err) {
                next(null, false);
            }
            if (!result){
                // if no user found
                next(null, false);
            }else {
                // if user found
                next(null, result);
            }
        
    });
});

module.exports = strategy;