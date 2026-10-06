require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express()
const PORT = process.env.PORT || 3000;
require('./modules');

const authRouter = require('./routes/authRoutes');
const expenceRouter = require('./routes/expenceRoutes');
const cashfreeRoutes = require('./routes/cashfreeRoutes');
const sequelize = require('./utils/db_connect');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
app.use('/', cashfreeRoutes);
app.use('/expenses', expenceRouter);

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
