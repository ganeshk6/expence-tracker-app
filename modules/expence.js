const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db_connect');

const Expence = sequelize.define('expences', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    amount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
    },
    category:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:true
    }
})

module.exports = Expence