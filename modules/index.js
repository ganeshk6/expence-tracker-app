const User = require('./user');
const Expence = require('./expence');
const Order = require('./order');

//define relation
User.hasMany(Expence);
Expence.belongsTo(User);


User.hasMany(Order);
Order.belongsTo(User);

module.exports = {
    User,
    Expence,
    Order,
}