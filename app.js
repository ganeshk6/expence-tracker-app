require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
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

app.get("/", (req, res)=>{
    res.render('index', {
        title: 'Expence Tracker App'
    });
})
app.use('/', authRouter);
app.use('/', cashfreeRoutes);
app.use('/expenses', expenceRouter);

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

app.use(compression());

app.use(morgan('combined', {
    stream: accessLogStream
}));

app.use(express.static(path.join(__dirname, 'public')));

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
