import mongoose from 'mongoose';
import { userInfo } from 'os';
const _ = require('lodash');
let customerModel = mongoose.model('Customer');

exports.fetchAndSaveCustomers = async function (shop, accessToken) {
    console.log('Fetching customer data and saving ...')

    try {
        const url = `https://${shop}/admin/api/2019-10/customers.json`;
        let customerObj = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });
        customerObj = await customerObj.json();
    
        customerObj.customers.map(async (item) => {
            let body = _.pick(item, ['id', 'first_name', 'last_name', 'email', 'phone', 'last_order_id', 'orders_count', 'total_spent'])
            let newCustomer = new customerModel(body)
            await newCustomer.save(function (err, customer) {
                if (err) console.log('Customer saved failed', item.id)
                else console.log('Customer saved successfully', item.id)
            })
        })

    } catch(err) {
        console.log("Error in fethcing/saving cutomers", err.message)
    }
}


exports.getCustomers = (ctx) => {
    
    

}