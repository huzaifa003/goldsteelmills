const Sales = require('../models/Sales');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all sales with optional date filtering
async function getAllSales(req, res) {
    try {
        const { startDate, endDate } = req.query;

        // Build the query object
        let query = {};

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            }
            if (endDate) {
                query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
            }
        }

        const sales = await Sales.find(query).populate('supplier').populate('bills');
        res.status(200).json(sales);
    } catch (error) {
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Get sales by ID
async function getSalesById(req, res) {
    try {
        const salesId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(salesId)) {
            return res.status(400).json({ message: 'Invalid sales ID.' });
        }

        const sales = await Sales.findById(salesId).populate('supplier').populate('bills');
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }
        res.status(200).json(sales);
    } catch (error) {
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Create a new sale
async function createSales(req, res) {
    try {
        const { supplier, customerName, bills, totalAmount } = req.body;
        
        console.log(supplier);
        // Validate required fields
        if (!bills || bills.length === 0 || !totalAmount) {
            return res.status(400).json({ message: 'bills, and total amount are required.' });
        }

        // Validate supplier
        if (supplier && !mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({ message: 'Invalid supplier ID.' });
        }

        

        //Update Products record based on sales.
        let billQtyTotal=0;

        for (let billData of bills) {
            billQtyTotal += billData.quantity
            billData.itemType = null;
        }


        const products = await Product.find();
        for (const product of products){
            product.stock = product.stock - billQtyTotal;
            if (product.stock < 0){
                return res.status(400).json({ message: 'Insufficient stock', item: product.name, stock: product.stock + billQtyTotal });
            }
           
        }

        for (const product of products){
            const updatedProduct = await product.save();
        }


        // Validate and create bills
        const billIds = [];
        
        for (let billData of bills) {
            // if (!mongoose.Types.ObjectId.isValid(billData._id)) {
            //     return res.status(400).json({ message: `Invalid bill ID: ${billData._id}` });
            // }

            // Create and save the bill
            const newBill = new Bill(billData);
            const savedBill = await newBill.save();
            billIds.push(savedBill._id);
            
        }
        

        // Create the sales record
        const sales = new Sales({
            supplier: supplier || null,
            customerName: customerName || null,
            bills: billIds,
            totalAmount: totalAmount
        });

        const result = await sales.save();
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

async function getSalesBySupplier(req, res) {
    try {
        const { supplier, startDate, endDate } = req.params;

        // Build the query object
        let query = {};

        if (startDate || endDate) {
            query.date = {};

            if (startDate) {
                query.date.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
            }

            if (endDate) {
                query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
            }
        }

        if (supplier) {
            query.supplier = supplier;
        }

        console.log(query);

        const sales = await Sales.find(query).populate('supplier').populate('bills');
        // const sales = await Sales.find({ supplier: supplier }).populate('bills');

        res.status(200).json(sales);
    } catch (error) {
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }

}

const getSalesByCustomer = async (req, res) => {
    try {
        const { customerName } = req.params;

        const sales = await Sales.find({ customerName: customerName }).populate('bills');

        res.status(200).json(sales);
    } catch (error) {
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}
// Update a sale by ID
async function updateSales(req, res) {
    try {
        const salesId = req.params.id;
        const { supplier, bills, totalAmount } = req.body;

        // Validate sales ID
        if (!mongoose.Types.ObjectId.isValid(salesId)) {
            return res.status(400).json({ message: 'Invalid sales ID.' });
        }

        const sales = await Sales.findById(salesId).populate('bills');
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }

        // Validate and create/update bills
        const billIds = [];
        for (let billData of bills) {
            if (!mongoose.Types.ObjectId.isValid(billData._id)) {
                return res.status(400).json({ message: `Invalid bill ID: ${billData._id}` });
            }

            // Create and save the bill
            const newBill = new Bill(billData);
            const savedBill = await newBill.save();
            billIds.push(savedBill._id);
        }

        sales.supplier = supplier;
        sales.bills = billIds;
        sales.totalAmount = totalAmount;

        const updatedSales = await sales.save();
        res.status(200).json(updatedSales);
    } catch (error) {
        console.error('Error updating sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Delete a sale by ID
async function deleteSales(req, res) {
    try {
        const salesId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(salesId)) {
            return res.status(400).json({ message: 'Invalid sales ID.' });
        }

        const sales = await Sales.findByIdAndDelete(salesId).populate('bills');
        if (!sales) {
            return res.status(404).json({ message: 'Sales not found' });
        }

        res.status(200).json({ message: 'Sales deleted successfully' });
    } catch (error) {
        console.error('Error deleting sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

async function getIronBarScrape(req, res) {
    try{
        let quantity = 0;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const sales = await Sales.find({ date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } }).populate('bills');
        for (let sale of sales) {
            for (let bill of sale.bills) {
                quantity += bill.quantity;
            }
        }

        const product = await Product.findOne({ name: { $regex: /^iron bar$/i } });
        
        if (!product) {
            return res.status(400).json({ message: 'Please add Iron Bar' });
        }

        const scrapeIronBar = quantity - product.stock;
        
        return res.status(200).json({ scrapeIronBar });
    } catch (error) {
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });    
    }
}

module.exports = {
    getAllSales,
    getSalesById,
    createSales,
    updateSales,
    deleteSales,
    getSalesByCustomer,
    getSalesBySupplier,
    getIronBarScrape,
};
