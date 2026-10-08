const User = require('./user');
const Expence = require('./expence');
const Order = require('./order');
const DownloadFile = require('./DownloadedFile');
const ForgotPasswordRequests = require('./ForgotPasswordRequests');

//define relation
User.hasMany(Expence);
Expence.belongsTo(User);


User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasOne(DownloadFile);
DownloadFile.belongsTo(User);

module.exports = {
    User,
    Expence,
    Order,
    ForgotPasswordRequests,
    DownloadFile
}