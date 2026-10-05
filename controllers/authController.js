const path = require('path');

const loginPage = (req, res) => {
    res.render('pages/auth/register', {
        title: 'Expence Tracker App - Sign-Up'
    })
}

module.exports = {
    loginPage
}