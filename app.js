require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express()
const PORT = process.env.PORT || 3000;

const authRouter = require('./routes/authRoutes');
const sequelize = require('./utils/db_connect');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'expense_tracker_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res)=>{
    res.render('index', {
        title: 'Expence Tracker App'
    });
})
app.use('/', authRouter);

sequelize.sync({force: false})
.then(()=>{
    console.log("Database synchronized")
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err)=>{
    console.error(err);
})
