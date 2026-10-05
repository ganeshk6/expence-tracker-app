const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const User = require('../modules/user');

const signupPage = (req, res) => {
    res.render('pages/auth/register', {
        title: 'Expence Tracker App - SignUp'
    })
}

const loginPage = (req, res) => {
    res.render('pages/auth/login', {
        title: 'Expence Tracker App - SignIn'
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

module.exports = {
    loginPage,
    signupPage,
    signup,
    createSignin
}