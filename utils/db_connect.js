const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
});

(async () => {
    try{
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
    }catch(err){
        console.error("Database connection failed:", err);
    }
})();

module.exports = sequelize
