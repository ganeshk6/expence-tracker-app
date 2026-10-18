const { fn, col, literal, Op } = require('sequelize');
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

const getExpenseDateFilter = (filterType, filterValue) => {
    // No filter selected
    if (!filterType && !filterValue) {
        return {};
    }

    // Reject incomplete filter
    if (!filterType || !filterValue) {
        throw new Error('Please select a valid date filter.');
    }

    let startDate;
    let endDate;

    if (filterType === 'daily') {
        // Expected: YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(filterValue)) {
            throw new Error('Invalid daily date format.');
        }

        startDate = new Date(`${filterValue}T00:00:00.000Z`);

        if (
            Number.isNaN(startDate.getTime()) ||
            startDate.toISOString().slice(0, 10) !== filterValue
        ) {
            throw new Error('Invalid daily date.');
        }

        endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);

    } else if (filterType === 'monthly') {
        // Expected: YYYY-MM
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(filterValue)) {
            throw new Error('Invalid month format.');
        }

        const [year, month] = filterValue.split('-').map(Number);

        startDate = new Date(Date.UTC(year, month - 1, 1));
        endDate = new Date(Date.UTC(year, month, 1));

    } else if (filterType === 'yearly') {
        // Expected: YYYY
        if (!/^\d{4}$/.test(filterValue)) {
            throw new Error('Invalid year format.');
        }

        const year = Number(filterValue);

        if (year < 2000 || year > 2100) {
            throw new Error('Year must be between 2000 and 2100.');
        }

        startDate = new Date(Date.UTC(year, 0, 1));
        endDate = new Date(Date.UTC(year + 1, 0, 1));

    } else {
        throw new Error('Invalid filter type.');
    }

    return {
        createdAt: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
        }
    };
};


const escapeCsv = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const str = String(value);

    // Escape double quotes and wrap fields containing special characters
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
};


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
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );
        const offset = (page - 1) * limit;

        const { filterType, filterValue } = req.query;

        const dateFilter = getExpenseDateFilter(
            filterType,
            filterValue
        );

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where: {
                userId,
                ...dateFilter
            },
            limit: limit,
            offset: offset,

            order: [
                ['id', 'DESC']
            ],
        });
        const formattedExpenses = expenses.map(expense => {
            const data = expense.toJSON();

            return {
                ...data,
                expenseDate: new Date(data.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC'
                })
            };
        });
        const totalPages = Math.ceil(count / limit);
        
        return sendSuccessResponse(res, {expenses:formattedExpenses, currentPage: page, totalPages, totalItems: count, limit}, "Expenses fetched successfully", 200);    
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
        const { filterType, filterValue } = req.query;

        const dateFilter = getExpenseDateFilter(
            filterType,
            filterValue
        );

        const expenses = await Expense.findAll({
            where: {
                userId,
                ...dateFilter
            },
            order: [
                ["id", "DESC"]
            ]
        });

        if (!expenses || expenses.length === 0) {
            return sendErrorResponse(res,"No expenses found", "No expenses available for download",404);
        }

        const csvHeader = "Amount,Category,Description,Note,Date\n";

        const csvRows = expenses.map((expense) => {
            const data = expense.toJSON();

            const expenseDate = new Date(data.createdAt)
                .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC'
                });

            return [
                data.amount ?? '',
                escapeCsv(data.category),
                escapeCsv(data.description),
                escapeCsv(data.note),
                escapeCsv(expenseDate)
            ].join(',');
        });

        const csvData = '\uFEFF' + csvHeader + csvRows.join('\n');
        const suffix = filterType && filterValue
                        ? `_${filterType}_${filterValue}`
                        : '';

        // File name
        const fileName = `expenses_${userId}${suffix}_${Date.now()}.csv`;

        // S3 path
        const s3Key = `expenses/${userId}/${fileName}`;

        // Upload CSV to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            Body: csvData,
            ContentType: 'text/csv; charset=utf-8'
        });

        await s3Client.send(uploadCommand);

        // Create temporary download URL
        const getObjectCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            ResponseContentType: 'text/csv',
            ResponseContentDisposition:
                `attachment; filename="${fileName}"`
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