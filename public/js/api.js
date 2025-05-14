const API_BASE_URL = 'http://localhost:3000/api';

// Customer API
const customerAPI = {
    async create(data) {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async getAll() {
        const response = await fetch(`${API_BASE_URL}/customers`);
        return response.json();
    },

    async getById(id) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`);
        return response.json();
    },

    async update(id, data) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async topup(id, amount) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_topup: amount })
        });
        return response.json();
    }
};

// Order API
const orderAPI = {
    async create(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
            }
            return response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    async getByCustomerId(customerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/customer/${customerId}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อของลูกค้า');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            throw error;
        }
    }
};

// Transaction API
const transactionAPI = {
    async create(data) {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async getAll(filters = {}) {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`);
        return response.json();
    },

    async getYearlyDashboard(year) {
        const response = await fetch(`${API_BASE_URL}/transactions/dashboard/yearly?year=${year}`);
        return response.json();
    }
};

// Utility functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH');
};

// Export
window.api = {
    customer: customerAPI,
    order: orderAPI,
    transaction: transactionAPI,
    utils: {
        formatCurrency,
        formatDate
    }
}; 