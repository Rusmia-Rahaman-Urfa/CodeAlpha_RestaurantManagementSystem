require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// Path matches your schemas.js file in the root
const { User, Menu, Inventory, Table } = require('./schemas'); 

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
const mongoURI = process.env.MONGO_URI; 

// SEED ROUTE (RUN THIS ONCE IN BROWSER TO SET UP EVERYTHING) ---
app.get('/api/seed', async (req, res) => {
    try {
        // Clear old data to start fresh
        await User.deleteMany({});
        await Inventory.deleteMany({});

        // Create Admin
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Lumiere Admin",
            email: "rusmiarahaman77461@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        // Create Sample Inventory
        await Inventory.insertMany([
            { itemName: "Wagyu Beef", stockQuantity: 50, unit: "kg", minLimit: 10 },
            { itemName: "Vintage Red Wine", stockQuantity: 5, unit: "bottles", minLimit: 10 },
            { itemName: "Truffle Oil", stockQuantity: 20, unit: "liters", minLimit: 5 }
        ]);

        res.send("<h1>✅ Success!</h1><p>Admin created (admin@lumiere.com / admin123) and Inventory seeded.</p>");
    } catch (err) {
        res.status(500).send("Seed Error: " + err.message);
    }
});

// AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, name: user.name });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// ADMIN ROUTES (Inventory) 
const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(401).json({ error: "Admin only" });
        req.user = decoded;
        next();
    });
};

app.get('/api/admin/inventory', verifyAdmin, async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items); // This makes the Inventory variable 'light up'
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// PUBLIC ROUTES (Menu) 
app.get('/api/menu', async (req, res) => {
    try {
        const items = await Menu.find();
        res.json(items); // This makes the Menu variable 'light up'
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// CONNECTION 
const PORT = process.env.PORT || 5005;

// move the listen command OUTSIDE the database check
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER FORCED START!`);
    console.log(`✅ Running on: http://localhost:${PORT}`);
    console.log(`⚠️  NOTE: Database is NOT connected, but the routes are active.\n`);
});

// Try to connect in the background, but don't let it stop the server
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("💎 MongoDB Connected"))
    .catch(err => console.log("❌ DB Connection Failed, but Server is still running."));