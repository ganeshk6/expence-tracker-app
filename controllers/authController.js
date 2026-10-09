const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { sendForgotPasswordEmail } = require('../services/sendEmailServices');
const sequelize = require("../utils/db_connect");
const User = require('../modules/user');
const ForgotPasswordRequests = require('../modules/ForgotPasswordRequests');

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
    const transaction = await sequelize.transaction();
    try{
        const {email} = req.body;
        if (!email) {
            await transaction.rollback();
            return sendErrorResponse(res,[],'Email is required',400);
        }
        const user = await User.findOne({
            where:{
                email:email
            }
        })
        if(!user){
            await transaction.rollback();
            return sendErrorResponse(res, [], 'User not found for this email', 404);
        }
        const requestId = uuidv4();
        await ForgotPasswordRequests.create({
            id: requestId,
            userId: user.id,
            isactive: true
        }, {
            transaction
        });
        const resetLink = `${process.env.API_URL}/password/resetpassword/${requestId}`;
        
        await sendForgotPasswordEmail(
            user.email,
            user.full_name,
            resetLink
        );
        await transaction.commit();
        return sendSuccessResponse(res,{email: user.email},'I have sent you an email. Please check your inbox.',200);
    }catch(err){
        await transaction.rollback();
        return sendErrorResponse(res, err.message, "Failed to send link", 500);
    }
}

const resetPasswordForm = async (req, res) => {
    try{
        const {id} = req.params;

        const request = await ForgotPasswordRequests.findOne({
            where:{
                id:id,
                isactive: true
            }
        })
        if(!request){
            return res.status(400).send(`
                <h2>Invalid or expired password reset link</h2>
            `);
        }
        return res.render('pages/auth/resetPassword', {
            requestId: id
        });
    }catch(err){

    }
}

const resetPassword = async(req, res) => {
    const transaction = await sequelize.transaction();
    try{
        const {requestId, password, confirmPassword } = req.body;
        if (!requestId || !password || !confirmPassword) {
            await transaction.rollback();
            return sendErrorResponse(res,[],'All fields are required',400);
        }
        if (password !== confirmPassword) {
            await transaction.rollback();
            return sendErrorResponse(res,[],'Passwords do not match',400);
        }

        const forgotRequest = await ForgotPasswordRequests.findOne({
                                        where: {
                                            id: requestId,
                                            isactive: true
                                        },
                                        transaction
                                    });

        if (!forgotRequest) {
            await transaction.rollback();
            return sendErrorResponse(res,[],'Invalid or expired reset link',400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update(
            {
                password: hashedPassword
            },
            {
                where: {
                    id: forgotRequest.userId
                },
                transaction
            }
        );
        await ForgotPasswordRequests.update(
            {
                isactive: false
            },
            {
                where: {
                    id: requestId
                },
                transaction
            }
        );
        await transaction.commit();
        return sendSuccessResponse(res,[],'Password reset successfully',200);
    }catch(err){
        await transaction.rollback();
        return sendErrorResponse(res,err.message,'Failed to reset password',500);
    }
}

const userLogout = async(req, res) => {
    try {

        return res.status(200).json({
            success: true,
            message: 'Logout successfully'
        });

    } catch (error) {

        console.error('Logout error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to logout'
        });
    }
}

module.exports = {
    loginPage,
    signupPage,
    signup,
    createSignin,
    forgotPasswordForm,
    sendForgotPasswordLink,
    resetPasswordForm,
    resetPassword,
    userLogout
}