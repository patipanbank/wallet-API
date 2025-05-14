const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');

// Create order
router.post('/', async (req, res) => {
    try {
        const { customerId, productName, price } = req.body;
        
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Calculate final price with discount
        const discountRate = customer.rate_discount || 0;
        const finalPrice = price * (1 - discountRate / 100);

        // Check if customer has enough balance
        if (customer.wallet < finalPrice) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Create order
        const order = new Order({
            customer: customerId,
            productName,
            originalPrice: price,
            discountRate,
            finalPrice
        });

        // Update customer wallet
        customer.wallet -= finalPrice;
        await customer.save();
        await order.save();

        res.status(201).json({
            order,
            remainingBalance: customer.wallet
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer orders
router.get('/customer/:customerId', async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.params.customerId })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 