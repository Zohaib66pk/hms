import mongoose from 'mongoose';
import { userInfo } from 'os';
const _ = require('lodash');
let customerModel = mongoose.model('Customer');

// Fetch Customers from store and save it into local database
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

        customerObj.customers.map(async (item) => { // Store each customer in DB
            let body = _.pick(item, ['id', 'first_name', 'last_name', 'email', 'phone', 'last_order_id', 'orders_count', 'total_spent'])
            let newCustomer = new customerModel(body)
            await newCustomer.save(function (err, customer) {
                if (err) console.log('Customer saved failed', item.id)
                else console.log('Customer saved successfully', item.id)
            })
        })

    } catch (err) {
        console.log("Error in fethcing/saving cutomers", err.message)
    }
}

// Get All Customers
exports.getCustomers = async (ctx) => {

    try {
        await customerModel.find({}, (err, customers) => {
            if (err) {
                ctx.body = { status: 'failed', message: err.message }
            }
            else { // Make Array of Arrays for Polaris DataTables 
                let tempArr = []
                const customersCount = customers.length;
                const ratingRatio = parseInt((customersCount / 100) * 20);
                let rating = 5;
                let itemCount = ratingRatio;
                customers.map((item, index) => { // Map customers accroding to Polaris maping
                    tempArr.push([
                        item.first_name || '-',
                        item.last_name || '-',
                        item.email || '-',
                        item.phone || '-',
                        item.last_order_id || '-',
                        item.orders_count || '-',
                        item.total_spent || '-',
                        rating
                    ])
                    //Index starts from 0
                    if (itemCount === 0) {
                        rating = rating - 1;
                        itemCount = ratingRatio;
                    } else {
                        itemCount--;
                    }
                })
                ctx.body = { // Response
                    status: 'success',
                    data: tempArr
                };
            }
        }).sort({ orders_count: -1, last_order_id: -1, total_spent: -1 })
        //Order by Orders count, Last Order Id, Total Spending
    } catch (err) {
        ctx.body = { status: 'failed', message: err.message }
    }

}