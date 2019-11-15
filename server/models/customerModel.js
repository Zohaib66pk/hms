const  mongoose =  require('mongoose');
import { Date } from 'core-js';

const Schema = mongoose.Schema;

const Customer = new Schema({
    id: { // Customer id
        type: String,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    last_order_id: { // last order id
        type: String,
        default: ''
    },
    orders_count: { //number of purchases
        type: Number,
        default: 0
    },
    total_spent: { //total spend
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Customer', Customer);