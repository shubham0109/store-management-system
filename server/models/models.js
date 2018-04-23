const Sequelize = require('sequelize');
const sequelize = new Sequelize('mydb1', 'shubham', 'shubham0109', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// testing connection 
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});

// models

// Admin model
/*
    id : auto
    username : unique
    password
    firstname
    lastname

*/
const Admin = sequelize.define('admin', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false
    }
});


// Item model
/*
    id: auto
    name
    price
    quantity
    position
*/
const Item = sequelize.define('item', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    position: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// exports
exports.sequelize = sequelize;
exports.Admin = Admin;
exports.Item = Item;