const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db_connect');

const Order = sequelize.define('orders', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    payment_gateway: {
        type: DataTypes.STRING,
        defaultValue: 'CASHFREE'
    },

    payment_session_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            'PENDING',
            'PAID',
            'FAILED',
            'CANCELLED',
            'EXPIRED'
        ),
        defaultValue: 'PENDING'
    },

    payment_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    membership_type: {
        type: DataTypes.STRING,
        allowNull: false
    },

    membership_start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },

    membership_end_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
})

module.exports = Order