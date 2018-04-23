const express = require('express');
const router = express.Router();
const mysql      = require('mysql');
const _ = require('underscore');

// passport requirements
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// sequelize requirements
let model = require('./../models/models');
let sequelize = model.sequelize;
let Admin = model.Admin;
let Item = model.Item;

// creating the table
/*
Item.sync({force: true}).then(() => {
    // Table created
    return Item.create({
      name:'Lays',
      price: 20,  
      quantity: 5,
      position: 'A3'
    });
});
*/

router.get('/', (req, res) => {
    // index page / landing page -> redirect to login page
    res.redirect('/login');
});

router.get('/signup', (req, res) => {
    // render new admin signup page
    res.render('signup');
});

router.post('/signup', (req, res) => {
    // validate the user details and save it to the database
    let userName = req.body.username;
    let passWord = req.body.password;
    let firstName = req.body.firstname;
    let lastName = req.body.lastname;
//    console.log("fn: ", firstName);

// saving into db using sequelize
    Admin.create({
        username: userName,
        password: passWord,  
        firstname: firstName,
        lastname: lastName
        }).then(function(result, err) {
            if (err) {
              res.status(400).send(err);
            } else {
                // load up the payload with id of the user
                let payload = {id: result.id};
                // generate the token using jwt library
                let token = 'bearer ' + jwt.sign(payload, 'secret');
                // send back the token to be used for other purposes
                res.status(200).json({message: "logged in", token: token});
            }
          }).catch((err) => {
              res.status(400).send(err);
          });
    

});

router.get('/login', (req, res) => {
    // admin login page -> render the login page
    res.render('login');
});

router.post('/login', (req, res) => {
    // login the user 
    // check the details
    // if correct render admin page

//    console.log("username: ", req.body.username);
    Admin.find({
        where: {
            username: req.body.username
        }
    }).then((result, err) => {
            if (err) {
                res.send(err);
            }
            if (!result){
                // user not found
                res.status(404).json({message:"no user found"});
            }
            if(result.password === req.body.password) {
                // if password match

                // load up the payload with id of the user
                let payload = {id: result.id};
                // generate the token using jwt library
                let token = 'bearer ' + jwt.sign(payload, 'secret');
                // send back the token to be used for other purposes
                res.status(200).json({message: "logged in", token: token});
            } else {
                // if password don't match
                res.status(401).json({message:"Incorrect password"});
            }
        
    });

});

router.get('/add', (req, res) => {
    // render new order page
    res.render('add_items');
});

router.post('/add', passport.authenticate('jwt', { session: false }), (req, res) => {
    // save the data in database
    //console.log("you are inside");
    let name = req.body.name;
    let price = req.body.price;
    let quantity = req.body.quantity;
    let position = req.body.position;
    console.log("name", name);
    
    // create a new row
    Item.create({
        name: name,
        price: price,  
        quantity: quantity,
        position: position
        }).then((err, result) => {
            if (err) {
              res.send(err);
            } else {
              res.send(result.get({
                plain: true
              }))
            }
          });
});

router.get('/edit', (req, res) => {
    // render the update page
    res.render('edit_items');
});

router.post('/edit', passport.authenticate('jwt', { session: false }), (req, res) => {
    // update the databse;
    // use the middleware to check for token

    let name = req.body.name;
    let newname = req.body.newname;
    let newprice = req.body.newprice;
    let newquantity = req.body.newquantity;
    let newposition = req.body.newposition;

    Item.find({ where: { name: name } })
    .then((result, err) => {
        // Check if record exists in db
        if (err){
            throw err;
        }
        if (result) {
        result.updateAttributes({
            name: newname,
            price: newprice,
            quantity: newquantity,
            position: newposition
        })
        .then((result, err) => {
            if (err){
                res.status(404).json({"message": "not found"})
            }
            res.status(200).json({"message": "item updated"});
        });
        }
    });
});

router.get('/delete', (req, res) => {
    // render the delete page
    res.render('delete_items');
});

router.post('/delete',  passport.authenticate('jwt', { session: false }), (req, res) => {
    // delete an item from the database

    // get the name of the item to be deleted
    let name = req.body.name;

    // delete the item
    Item.destroy({
        where: {
           name: name
       }
    }).then((result, err) => {
            if (err){
                res.status(404).json({"message": "not found"});
            }   
            res.status(200).json({"result": result});
    });
});

router.post('/normalquery', passport.authenticate('jwt', { session: false }), (req, res) => {
    // get the name of the item queried
    let name = req.body.name;

    Item.findAll({
        where: {
            name: name
        }
    }).then((result, err) => {
        if (err){
            res.json({"message": "error"})
        }
        if (! result){
            res.status(404).json({"message": "item not there in database"});
        }
        res.status(200).send(result);
    });

});

router.post('/sqlquery', passport.authenticate('jwt', { session: false }), (req, res) => {
    // get the sql query
    let sql = req.body.sql;
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(result => {
        res.send(result);
    });

});

router.get('/analysis', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    Item.findAll().then((result, err) => {
        if (err){
            res.json({"message": "error"})
        }
        if (! result){
            res.status(404).json({"message": "item not there in database"});
        }
        let total_amount = 0;
        let total_items = 0;

        _.each(result, (obj) => {
            total_items += obj.quantity;
            total_amount += (obj.quantity * obj.price);
        });
        res.status(200).json({"total items": total_items, "total amount": total_amount});
    });

});

  
module.exports = router;
