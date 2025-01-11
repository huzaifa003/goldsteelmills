const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const requestLogger = require('./middleware/SystemMiddleware');

const connectDB = require('./config/db');


const app = express();
app.use(cors({
    origin: '*',  // Allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static('public'));


app.use(requestLogger);
app.use('/users', require('./routes/UserRoute'));
app.use('/suppliers', require('./routes/SupplierRoute'));
app.use('/categories', require('./routes/CategoryRoute'));
app.use('/expenses', require('./routes/ExpenseRoute'));
app.use('/items', require('./routes/ItemRoute'));
app.use('/bills', require('./routes/BillRoute'));
app.use('/purchases', require('./routes/PurchaseRoute'));
app.use('/sales', require('./routes/SalesRoute'));
app.use('/daybook', require('./routes/DaybookRoute'));
app.use('/products', require('./routes/ProductRoute'));
app.use('/productions', require('./routes/ProducionRoute'));

app.get('/hello', (req, res) => {
    res.send('Hello, world!');
});


connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log('Server started on port ' + process.env.PORT);
    });
})
.catch((err) => {
    console.error(err.message);
    process.exit(1);
});

