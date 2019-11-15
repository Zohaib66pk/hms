import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
import cors from '@koa/cors'
import mongoose from 'mongoose';

const _ = require('lodash'); // to get specific body fields
mongoose.connect('mongodb://localhost:27017/hms_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err) {
  if (err) console.log('Error connecting mongodb', err.message)
});

const customerModel = require('./models/customerModel');
const orderModel = require('./models/orderModel');
const customerController = require('./controllers/customerController');
const orderController = require('./controllers/orderController');


dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false
        });
        customerController.fetchAndSaveCustomers(ctx.session.shop, ctx.session.accessToken)
        orderController.fetchAndSaveOrders(ctx.session.shop, ctx.session.accessToken)
        ctx.redirect("/");
      }
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.October19
    })
  );
  server.use(cors())

  // Get All customers data from  MongoDB
  router.get('/api/customers', async (ctx, next) => {
    try {
      await customerModel.find({}, (err, customers) => {
        if (err) {
          ctx.body = { status: 'failed', message: err.message }
        }
        else { // Make Array of Arrays for Polaris DataTables 
          let tempArr = []
          const customersCount = customers.length;
          const ratingRatio = (customersCount / 100) * 20;
          let rating = 5;
          customers.map((item, index) => {
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
            if ((index + 1) % ratingRatio === 0) rating = rating - 1;
          })
          ctx.body = { // Response
            status: 'success',
            data: tempArr
          };
        }
      }).sort({orders_count: -1})
    } catch (err) {
      ctx.body = { status: 'failed', message: err.message }
    }
  })

  router.get("*", verifyRequest(), async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;

  })


  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

});



