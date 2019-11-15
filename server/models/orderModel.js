const mongoose = require('mongoose');
import { Date } from 'core-js';

const Schema = mongoose.Schema;

const Order = new Schema({
    id: { // Order id
        type: String,
        required: true,
        unique: true
    },
    created_at: { // Order date
        type: Date,
        default: Date.now
    },
    updated_at: { // Order date
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model('Order', Order);