const mongoose = require('mongoose');

// Menu Schema
const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String, // Starter, Main, Dessert
    ingredients: [{ item: String, quantity: Number }] // Linked to Inventory
});

// Inventory Schema
const InventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    stockQuantity: { type: Number, required: true },
    unit: String, // kg, grams, pcs
    minLimit: { type: Number, default: 10 } // For Stock Alerts
});

// Table & Reservation Schema
const TableSchema = new mongoose.Schema({
    tableNumber: Number,
    capacity: Number,
    isAvailable: { type: Boolean, default: true },
    reservations: [{ 
        customerName: String, 
        time: String, 
        status: { type: String, default: 'Booked' } 
    }]
});

module.exports = {
    Menu: mongoose.model('Menu', MenuSchema),
    Inventory: mongoose.model('Inventory', InventorySchema),
    Table: mongoose.model('Table', TableSchema)
};