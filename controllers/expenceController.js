const { fn, col, literal } = require('sequelize');
const Expense = require('../modules/expence');
const User = require('../modules/user');
const DownloadFile = require('../modules/DownloadedFile');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { suggestExpenseCategory } = require('../services/geminiService');

const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = require("../utils/s3");

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
        const {amount, category, description, note} = req.body;

        const expense = await Expense.create({
            userId:userId,
            amount:amount,
            category:category,
            description:description,
            note:note
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where:{
                userId:userId
            },
            limit: limit,
            offset: offset,

            order: [
                ['id', 'DESC']
            ]
        });
        const totalPages = Math.ceil(count / limit);
        
        return sendSuccessResponse(res, {expenses, currentPage: page, totalPages, totalItems: count, limit}, "Expenses fetched successfully", 200);    
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

const downloadExpenses = async (req, res) => {
    try {
        const userId = req.user.id;

        const expenses = await Expense.findAll({
            where: {
                userId: userId
            },
            order: [
                ["id", "DESC"]
            ]
        });

        if (!expenses || expenses.length === 0) {
            return sendErrorResponse(res,"No expenses found", "No expenses available for download",404);
        }

        const csvHeader = "Amount,Category,Description,Note\n";

        const csvRows = expenses.map((expense) => {

            const amount = expense.amount ?? "";
            const category = expense.category ?? "";
            const description = expense.description ?? "";
            const note = expense.note ?? "";

            return [
                amount,
                `"${String(category).replace(/"/g, '""')}"`,
                `"${String(description).replace(/"/g, '""')}"`,
                `"${String(note).replace(/"/g, '""')}"`
            ].join(",");
        });

        const csvData = csvHeader + csvRows.join("\n");

        // File name
        const fileName = `expenses_${userId}_${Date.now()}.csv`;

        // S3 path
        const s3Key = `expenses/${userId}/${fileName}`;

        // Upload CSV to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            Body: csvData,
            ContentType: "text/csv"
        });

        await s3Client.send(uploadCommand);

        // Create temporary download URL
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            ResponseContentType: "text/csv",
            ResponseContentDisposition: `attachment; filename="${fileName}"`
        });

        const fileUrl = await getSignedUrl(
            s3Client,
            getObjectCommand,
            {
                expiresIn: 3600
            }
        );

        await DownloadFile.create({
            userId: userId,
            fileName: fileName,
            s3Key: s3Key,
            downloadedAt: new Date()
        });

        return sendSuccessResponse(
            res,
            {
                fileUrl: fileUrl,
                fileName: fileName
            },
            "Expenses file generated successfully",
            200
        );

    } catch (err) {

        console.error("Download Expenses Error:", err);

        return sendErrorResponse(
            res,
            err.message,
            "Failed to download expenses",
            500
        );
    }
};

module.exports = {
    addExpencePage,
    addExpence,
    getAllExpences,
    getExpencePage,
    deleteExpense,
    expenseLeaderboardPage,
    suggestCategory,
    downloadExpenses
}