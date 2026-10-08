const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db_connect');

const DownloadFile = sequelize.define('download_files', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s3Key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    downloadedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

module.exports = DownloadFile