const { fn, col, literal } = require('sequelize');
const Expense = require('../modules/expence');
const User = require('../modules/user');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { suggestExpenseCategory } = require('../services/geminiService');

const addExpencePage = (req, res) => {
    res.render('pages/expence/add', {
        title: 'Add expense - Expense Tracker App'
    })
}

const expenseLeaderboardPage = async (req, res) => {
    try{
        const users = await User.findAll({
            attributes: [
                'id',
                'full_name',
                [fn('COALESCE', fn('SUM', col('expences.amount')), 0), 'totalExpense']
            ],
            include: [
                {
                    model: Expense,
                    attributes: [],
                    required: false
                }
            ],
            group: ['id', 'full_name'],
            order: [[literal('totalExpense'), 'DESC']]
        });
        
        res.render('pages/expence/leaderBoard', {
            title: 'Expense Leaderboard - Expense Tracker App',
            users:users
        })
    }catch(err){
        res.render('pages/expence/leaderBoard', {
            title: 'Expense Leaderboard - Expense Tracker App'
        })
    }
}

const addExpence = async (req, res) => {
    try{
        const userId = req.user.id;
        const {amount, category, description} = req.body;

        const expense = await Expense.create({
            userId:userId,
            amount:amount,
            category:category,
            description:description
        });
        return sendSuccessResponse(res,expense,'Expense added successfully',201);

    }catch(err){
        return sendErrorResponse(res, err.message, "Failed to add expense", 500);
    }
}

const getExpencePage = (req, res) => {
    res.render('pages/expence/index', {
        title: 'All Expense - Expense Tracker App'
    })
}

const getAllExpences = async(req, res) => {
    try{
        const userId = req.user.id;
        const expenses = await Expense.findAll({
            where:{
                userId:userId
            }
        })
        return sendSuccessResponse(res, expenses, "Expenses fetched successfully", 200);    
    }catch(err){
        return sendErrorResponse(res, err.message, "Failed to fetch expense", 500);
    }
}

const deleteExpense = async(req, res) => {
    try{
        const { id } = req.params;
        const userId = req.user.id;
        const deletedExpense = await Expense.destroy({
            where: {
                id: id,
                userId: userId
            }
        });
        if (deletedExpense === 0) {
            return sendErrorResponse(res,[],"Expense not found",404);
        }
        return sendSuccessResponse(res, [], "Expense deleted successfully", 200);    
    }catch(err){
        return sendErrorResponse(res, err.message, "Failed to delete expense", 500);
    }
}

const suggestCategory = async(req, res) => {
    try{
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Description is required'
            });
        }

        const category = await suggestExpenseCategory(description);
        return res.status(200).json({
            success: true,
            message: 'Category suggested successfully',
            data: {
                category: category
            }
        });

    }catch(err){
        return sendErrorResponse(res, err.message, "Gemini category suggestion error", 500);
    }
}

module.exports = {
    addExpencePage,
    addExpence,
    getAllExpences,
    getExpencePage,
    deleteExpense,
    expenseLeaderboardPage,
    suggestCategory
}