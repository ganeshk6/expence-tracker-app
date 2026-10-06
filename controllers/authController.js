const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { sendForgotPasswordEmail } = require('../services/sendEmailServices');
const User = require('../modules/user');

const signupPage = (req, res) => {
    res.render('pages/auth/register', {
        title: 'SignUp - Expence Tracker App'
    })
}

const loginPage = (req, res) => {
    res.render('pages/auth/login', {
        title: 'SignIn - Expence Tracker App'
    })
}

const forgotPasswordForm = (req, res) => {
    res.render('pages/auth/forgotPassword', {
        title: 'Forgot Password - Expence Tracker App'
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
            return sendErrorResponse(res, [], 'Email already registered, please signin', 401);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            full_name:full_name,
            email:email,
            password:hashedPassword
        });
        const userData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email
        };
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }

        );
        return sendSuccessResponse(res, {user:userData, token:token}, 'User registered successfully', 201);
    }catch(err){
        return sendErrorResponse(res, err.message, 'Failed to signup user', 500);
    }
}

const createSignin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return sendErrorResponse(res,[],'Email and password are required',400);
        }

        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            return sendErrorResponse(res,[],'Invalid email or password',401);
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return sendErrorResponse(res,[],'Invalid email or password',401);
        }

        const userData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email
        };
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );
        return sendSuccessResponse(res,{user:userData, token: token},'Login successful',200);

    } catch (err) {
        return sendErrorResponse(res,err.message,'Failed to login user',500);
    }
};

const sendForgotPasswordLink = async(req, res) => {
    try{
        const {email} = req.body;
        if (!email) {
            return sendErrorResponse(res,[],'Email is required',400);
        }
        const user = await User.findOne({
            where:{
                email:email
            }
        })
        if(!user){
            return sendErrorResponse(res, [], 'User not found for this email', 404);
        }
        
        const resetLink = `http://localhost:3000/reset-password/${email}`;
        
        await sendForgotPasswordEmail(
            user.email,
            user.full_name,
            resetLink
        );

        return sendSuccessResponse(res,{email: user.email},'I have sent you an email. Please check your inbox.',200);
    }catch(err){
        return sendErrorResponse(res, err.message, "Failed to send link", 500);
    }
}

module.exports = {
    loginPage,
    signupPage,
    signup,
    createSignin,
    forgotPasswordForm,
    sendForgotPasswordLink
}