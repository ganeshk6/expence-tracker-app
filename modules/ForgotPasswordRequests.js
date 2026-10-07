const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db_connect');

const ForgotPasswordRequests = sequelize.define('forgot_password_requests', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    isactive:{
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
})

module.exports = ForgotPasswordRequests