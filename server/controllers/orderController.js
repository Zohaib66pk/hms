import mongoose from 'mongoose';
const _ = require('lodash');
let orderModel = mongoose.model('Order');

// Fetch Orders from store and save it into local database
exports.fetchAndSaveOrders = async function (shop, accessToken) {
    console.log('Fetching order data and saving ...')

    try {

        const url = `https://${shop}/admin/api/2019-10/draft_orders.json`;
        let orderObj = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        orderObj = await orderObj.json();
        orderObj.draft_orders.map(async (item) => {
            let body = _.pick(item, ['id', 'created_at', 'updated_at'])
            let newOrder = new orderModel(body)
            await newOrder.save(function (err, customer) {
                if (err) console.log('Order saved failed', item.id)
                else console.log('Order saved successfully', item.id)
            })
        })
    } catch (err) {
        ctx.body = { status: 'failed', message: err.message };
    }
}