const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Bill = require('../models/Bill');
const Item = require('../models/Item');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Get all purchases with optional date filtering
async function getAllPurchases(req, res) {
    try {
        const { startDate, endDate, supplierId } = req.query;


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

        if (supplierId) {
            query.supplier = supplierId;
        }
        console.log(query)

        const purchases = await Purchase.find(query).populate('supplier').populate('bills');
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error retrieving purchases:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Get purchase by ID
async function getPurchaseById(req, res) {
    try {
        const purchaseId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ message: 'Invalid purchase ID.' });
        }

        const purchase = await Purchase.findById(purchaseId).populate('supplier').populate('bills');
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json(purchase);
    } catch (error) {
        console.error('Error retrieving purchase:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Create a new purchase
// async function createPurchase(req, res) {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { supplier, bills, totalAmount } = req.body;

//         // Validate required fields
//         if (!supplier || !bills || bills.length === 0 || !totalAmount) {
//             return res.status(400).json({ message: 'Supplier, bills, and total amount are required.' });
//         }

//         // Validate supplier
//         if (!mongoose.Types.ObjectId.isValid(supplier)) {
//             return res.status(400).json({ message: 'Invalid supplier ID.' });
//         }

//         const supplierExists = await Supplier.findById(supplier);
//         if (!supplierExists) {
//             return res.status(404).json({ message: 'Supplier not found' });
//         }

//         // Create bills
//         const billIds = [];
//         for (let billData of bills) {
//             const newBill = new Bill(billData);
//             const savedBill = await newBill.save({ session });
//             billIds.push(savedBill._id);
//         }

//         const purchase = new Purchase({
//             supplier,
//             bills: billIds,
//             totalAmount
//         });

//         const result = await purchase.save({ session });
//         await session.commitTransaction();
//         session.endSession();

//         res.status(201).json(result);
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();

//         console.error('Error creating purchase:', error.message);
//         res.status(500).json({ message: 'Internal server error: ' + error.message });
//     }
// }



async function createPurchase(req, res) {
    try {
        const { supplier, bills, totalAmount } = req.body;

        // Validate required fields
        if (!supplier || !bills || bills.length === 0 || !totalAmount) {
            return res.status(400).json({ message: 'Supplier, bills, and total amount are required.' });
        }

        // Validate supplier
        if (!mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({ message: 'Invalid supplier ID.' });
        }

        const supplierExists = await Supplier.findById(supplier);
        if (!supplierExists) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Create bills
        const billIds = [];
        for (let billData of bills) {
            const newBill = new Bill(billData);
            const item = await Item.findById(billData.itemType).exec();
            
            item.stock += billData.quantity;
            const savedItem = await item.save();
            
            
            const savedBill = await newBill.save(); // Save without session
            billIds.push(savedBill._id);
        }

        const purchase = new Purchase({
            supplier,
            bills: billIds,
            totalAmount
        });

        const result = await purchase.save(); // Save without session
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating purchase:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

const getScrapeOfBillet = async (req, res) => {
    try{ 

        let qty = 0;
        const purchases = await Purchase.find({}).populate('bills');
        for (const purchase of purchases) {
            for (const bill of purchase.bills) {
                qty += bill.quantity;
            }
        }

        const product = await Product.findOne({ name: { $regex: /^billet$/i } });
        if (!product) {
            return res.status(400).json({ message: 'Please add Billet' });
        }

        const scrapeBillet = qty - product.stock;

        return res.status(200).json({ scrapeBillet });

    }catch(error){
        console.error('Error retrieving sales:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });

    }
}


// Update a purchase by ID
async function updatePurchase(req, res) {
    try {
        const purchaseId = req.params.id;
        const { supplier, bills, totalAmount } = req.body;

        // Validate purchase ID
        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ message: 'Invalid purchase ID.' });
        }

        // Validate supplier if provided
        if (supplier && !mongoose.Types.ObjectId.isValid(supplier)) {
            return res.status(400).json({ message: 'Invalid supplier ID.' });
        }
        if (supplier) {
            const supplierExists = await Supplier.findById(supplier);
            if (!supplierExists) {
                return res.status(404).json({ message: 'Supplier not found' });
            }
        }

        // Validate bills if provided
        if (bills) {
            for (let billId of bills) {
                if (!mongoose.Types.ObjectId.isValid(billId)) {
                    return res.status(400).json({ message: `Invalid bill ID: ${billId}` });
                }
                const billExists = await Bill.findById(billId);
                if (!billExists) {
                    return res.status(404).json({ message: `Bill not found: ${billId}` });
                }
            }
        }

        const updatedPurchase = await Purchase.findByIdAndUpdate(
            purchaseId,
            { supplier, bills, totalAmount },
            { new: true, runValidators: true }
        );

        if (!updatedPurchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        res.status(200).json(updatedPurchase);
    } catch (error) {
        console.error('Error updating purchase:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Delete a purchase by ID
async function deletePurchase(req, res) {
    try {
        const purchaseId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
            return res.status(400).json({ message: 'Invalid purchase ID.' });
        }

        const purchase = await Purchase.findByIdAndDelete(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        // Delete associated bills
        for (let billId of purchase.bills) {
            const bill = await Bill.findByIdAndDelete(billId);
            if (!bill) {
                return res.status(404).json({ message: `Bill not found: ${billId}` });
            }

            const item = await Item.findById(bill.itemType).exec();
            item.stock -= bill.quantity;
            const savedItem = await item.save();
        }

        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        console.error('Error deleting purchase:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

const getPurchaseBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        // console.log(supplierId);
        const purchases = await Purchase.find({ supplier: supplierId }).populate('supplier').populate('bills');
        // console.log(purchases);
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error retrieving purchases:', error.message);
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}
module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    getPurchaseBySupplier,
    getScrapeOfBillet,
};
