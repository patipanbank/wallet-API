const express = require('express');
const router = express.Router();
const Customer = require('../models/customer.model');

// Create customer
router.post('/', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().select('-password');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-password');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Top up wallet
router.post('/:id/topup', async (req, res) => {
    try {
        const { wallet_topup } = req.body;
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customer.wallet += wallet_topup;
        await customer.save();
        
        res.json({ 
            message: 'Wallet topped up successfully',
            newBalance: customer.wallet
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 