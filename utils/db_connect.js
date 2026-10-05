const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('expence_tracker_app', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
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
