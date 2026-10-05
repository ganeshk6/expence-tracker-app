const User = require('./user');
const Expence = require('./expence');

//define relation
User.hasMany(Expence);
Expence.belongsTo(User);

module.exports = {
    User,
    Expence
}