// Import MongoDB client and bcrypt for password hashing
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Connection URL and Database Name
const url = 'mongodb://localhost:27017'; // MongoDB server URL
const dbName = 'fee_management_system'; // Database name
const client = new MongoClient(url);

// Function to connect to the database
async function connectToDatabase() {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
}

// Function to save user data
async function saveUser(userData) {
    const db = await connectToDatabase();
    const userCollection = db.collection('users');
    const result = await userCollection.insertOne(userData);
    console.log(`User inserted with id: ${result.insertedId}`);
}

// Function to find user by username
async function findUserByUsername(username) {
    const db = await connectToDatabase();
    const userCollection = db.collection('users');
    return await userCollection.findOne({ username: username });
}

// Function to update user password
async function updateUserPassword(username, newPassword) {
    const db = await connectToDatabase();
    const userCollection = db.collection('users');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userCollection.updateOne(
        { username: username },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    console.log(`Password updated for user: ${username}`);
}

// Function to save transaction data
async function saveTransaction(transactionData) {
    const db = await connectToDatabase();
    const transactionCollection = db.collection('transactions');
    const result = await transactionCollection.insertOne(transactionData);
    console.log(`Transaction inserted with id: ${result.insertedId}`);
}

// Function to handle user signup
async function handleSignup(username, email, password) {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
        throw new Error('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
        username: username,
        email: email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await saveUser(userData);
}

// Function to handle user login
async function handleLogin(username, password) {
    const user = await findUserByUsername(username);
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    console.log(`User ${username} logged in successfully`);
}

// Function to handle password change
async function handleChangePassword(username, oldPassword, newPassword) {
    const user = await findUserByUsername(username);
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid old password');
    }
    await updateUserPassword(username, newPassword);
}

// Function to handle a transaction
async function handleTransaction(username, amount, status, admissionNumber, purpose, referralCode) {
    const transactionData = {
        username: username,
        amount: amount,
        status: status,
        admissionNumber: admissionNumber,
        purpose: purpose,
        referralCode: referralCode,
        date: new Date(), // Current date
        createdAt: new Date(), // Timestamp for creation
        updatedAt: new Date(), // Timestamp for last update
    };
    await saveTransaction(transactionData);
}

// Example usage
(async () => {
    try {
        // Example of saving a user
        await handleSignup('john_doe', 'john@example.com', 'password123');

        // Example of logging in the user
        await handleLogin('john_doe', 'password123');

        // Example of changing the user's password
        await handleChangePassword('john_doe', 'password123', 'newpassword456');

        // Example of handling a transaction
        await handleTransaction('john_doe', 3000, 'Completed', '123456', 'Hostel Fee', 'REF123');
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await client.close(); // Close the connection
    }
})();
