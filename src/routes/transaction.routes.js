const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction.model');
const moment = require('moment');

// Create transaction
router.post('/', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get transactions with filters
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let query = {};

        // Add date filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = moment(startDate).startOf('day').toDate();
            if (endDate) query.date.$lte = moment(endDate).endOf('day').toDate();
        }

        // Add type filter
        if (type) {
            query.type = type;
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });
        
        // Calculate total balance
        const totalIncome = await Transaction.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpense = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const balance = (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0);

        res.json({
            transactions,
            balance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get yearly dashboard data
router.get('/dashboard/yearly', async (req, res) => {
    try {
        const year = req.query.year || moment().year();
        
        // Get monthly data
        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: moment(`${year}-01-01`).toDate(),
                        $lte: moment(`${year}-12-31`).toDate()
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get yearly totals
        const yearlyTotals = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: moment(`${year}-01-01`).toDate(),
                        $lte: moment(`${year}-12-31`).toDate()
                    }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get previous year totals for growth calculation
        const prevYearTotals = await Transaction.aggregate([
            {
                $match: {
                    date: {
                        $gte: moment(`${year-1}-01-01`).toDate(),
                        $lte: moment(`${year-1}-12-31`).toDate()
                    }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate growth rates
        const incomeGrowth = calculateGrowthRate(
            yearlyTotals.find(t => t._id === 'income')?.total || 0,
            prevYearTotals.find(t => t._id === 'income')?.total || 0
        );

        const expenseGrowth = calculateGrowthRate(
            yearlyTotals.find(t => t._id === 'expense')?.total || 0,
            prevYearTotals.find(t => t._id === 'expense')?.total || 0
        );

        // Format monthly data for chart
        const chartData = Array(12).fill().map((_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0
        }));

        monthlyData.forEach(item => {
            const monthIndex = item._id.month - 1;
            chartData[monthIndex][item._id.type] = item.total;
        });

        res.json({
            chartData,
            yearlyTotals: {
                income: yearlyTotals.find(t => t._id === 'income')?.total || 0,
                expense: yearlyTotals.find(t => t._id === 'expense')?.total || 0
            },
            growthRates: {
                income: incomeGrowth,
                expense: expenseGrowth
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to calculate growth rate
function calculateGrowthRate(current, previous) {
    if (!previous) return 100;
    return ((current - previous) / previous) * 100;
}

module.exports = router; 