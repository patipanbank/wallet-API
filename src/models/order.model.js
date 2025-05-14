const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    discountRate: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 