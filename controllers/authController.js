const bcrypt = require('bcrypt');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const User = require('../modules/user');

const loginPage = (req, res) => {
    res.render('pages/auth/register', {
        title: 'Expence Tracker App - Sign-Up'
    })
}

const signup = async(req, res) => {
    try{
        const {full_name, email, password} = req.body;
        if(!full_name || !email || !password){
            return sendErrorResponse(res, [], 'Full name, email and password are required', 400);
        }
        const existUser = await User.findOne({
            where:{
                email:email
            }
        })
        if(existUser){
            return sendErrorResponse(res, [], 'Email already registered, please signin', 409);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            full_name:full_name,
            email:email,
            password:hashedPassword
        });
        sendSuccessResponse(res, user, 'User registered successfully', 201);
    }catch(err){
        return sendErrorResponse(res, err.message, 'Failed to signup user', 500);
    }
}

module.exports = {
    loginPage,
    signup
}