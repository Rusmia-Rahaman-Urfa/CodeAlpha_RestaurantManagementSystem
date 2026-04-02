const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});

const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String, 
    image: String, 
    description: String,
    ingredients: [{ item: String, quantity: Number }] 
});

const InventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    stockQuantity: { type: Number, required: true },
    unit: String, 
    minLimit: { type: Number, default: 10 } 
});

const ReservationSchema = new mongoose.Schema({
    customerName: String, 
    time: String, 
    guests: Number,
    notes: { type: String, default: "Prestige Guest" },
    status: { type: String, default: 'Confirmed' },
    createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    customerName: String,
    items: String,
    totalPrice: Number,
    table: String,
    status: { type: String, default: 'In Queue' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Menu: mongoose.model('Menu', MenuSchema),
    Inventory: mongoose.model('Inventory', InventorySchema),
    Reservation: mongoose.model('Reservation', ReservationSchema),
    Order: mongoose.model('Order', OrderSchema)
};