const User = require('./user');
const Expence = require('./expence');
const Order = require('./order');
const ForgotPasswordRequests = require('./ForgotPasswordRequests');

//define relation
User.hasMany(Expence);
Expence.belongsTo(User);


User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

module.exports = {
    User,
    Expence,
    Order,
    ForgotPasswordRequests
}