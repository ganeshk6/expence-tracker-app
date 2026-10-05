const express = require('express');
const path = require('path');
const app = express()
const PORT = 3000

const authRouter = require('./routes/authRoutes');

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
