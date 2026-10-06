const express = require('express');
const router = express.Router();

const expenceController = require('../controllers/expenceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', expenceController.getExpencePage);
router.post('/list', authMiddleware, expenceController.getAllExpences);
router.get('/add', expenceController.addExpencePage);
router.post('/api/add', authMiddleware, expenceController.addExpence);
router.delete('/delete/:id', authMiddleware, expenceController.deleteExpense);
router.get('/leaderboard', expenceController.expenseLeaderboardPage);
router.post('/suggest-category', authMiddleware, expenceController.suggestCategory);

module.exports = router