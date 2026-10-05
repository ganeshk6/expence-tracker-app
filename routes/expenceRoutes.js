const express = require('express');
const router = express.Router();

const expenceController = require('../controllers/expenceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, expenceController.getExpencePage);
router.post('/', authMiddleware, expenceController.getAllExpences);
router.get('/add', authMiddleware, expenceController.addExpencePage);
router.post('/api/add', authMiddleware, expenceController.addExpence);
router.delete('/delete/:id', authMiddleware, expenceController.deleteExpense);

module.exports = router