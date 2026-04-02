require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User, Menu, Inventory, Reservation, Order } = require('./schemas'); 

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

app.get('/api/seed', async (req, res) => {
    try {
        await User.deleteOne({ email: "rusmiarahaman77461@gmail.com" });
        await Menu.deleteMany({});
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Lumiere Admin",
            email: "rusmiarahaman77461@gmail.com",
            password: hashedPassword,
            role: "admin"
        });
        const foodItems = [];
        const categories = ['Chinese', 'Italian', 'Pakistani'];
        for (let i = 1; i <= 50; i++) {
            const cat = categories[i % 3];
            foodItems.push({
                name: `${cat} Dish #${i}`,
                price: Math.floor(Math.random() * (3000 - 400) + 400),
                category: cat,
                description: `Premium ${cat} cuisine made with authentic traditional spices.`,
                image: `https://loremflickr.com/320/240/food,${cat.toLowerCase()}?lock=${i}`
            });
        }
        await Menu.insertMany(foodItems);
        res.send("<h1>✅ Seed Successful</h1>");
    } catch (err) { res.status(500).send("Seed Error: " + err.message); }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, role: 'customer' });
        res.status(201).json({ message: "Registration successful" });
    } catch (err) { res.status(400).json({ error: "Email already exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, role: user.role, name: user.name });
    } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.status(401).json({ error: "Admin only" });
        req.user = decoded;
        next();
    });
};

app.get('/api/menu', async (req, res) => {
    try { res.json(await Menu.find()); } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
    try { res.json(await Order.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.get('/api/admin/reservations', verifyAdmin, async (req, res) => {
    try { res.json(await Reservation.find().sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const o = new Order(req.body);
        await o.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json(err); }
});

app.post('/api/reservations', async (req, res) => {
    try {
        const r = new Reservation(req.body);
        await r.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
mongoose.connect(process.env.MONGO_URI).then(() => console.log("💎 MongoDB Connected"));