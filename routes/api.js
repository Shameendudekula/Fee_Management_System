const API_URL = 'http://localhost:8080/api';

// Authentication functions
async function loginUser({ username, password }) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Login failed: Network error');
    }
}

async function registerUser({ username, email, password }) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Registration failed: Network error');
    }
}

async function requestPasswordReset(email) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Password reset request failed');
    }
}

async function resetPassword({ email, code, newPassword }) {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword })
        });
        return await response.json();
    } catch (error) {
        throw new Error('Password reset failed');
    }
}

// Payment functions
async function submitPayment(paymentData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        return await response.json();
    } catch (error) {
        throw new Error('Payment submission failed');
    }
}

async function getPaymentHistory() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/payments/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        throw new Error('Failed to fetch payment history');
    }
} 