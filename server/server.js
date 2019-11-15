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
mongoose.connect('mongodb://localhost:27017/hms_db', { // Connect Mobgodb locally
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err) {
  if (err) console.log('Error connecting mongodb', err.message)
});

// Models
const customerModel = require('./models/customerModel');
const orderModel = require('./models/orderModel');

// Controllers
const customerController = require('./controllers/customerController');
const orderController = require('./controllers/orderController');

// Environment Setup
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev
});

// Shopify request handler
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET];

  // Middleware to check authentication before any request
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

        //Get data from shopify store after authentication and save it to DB
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

  // To allow cross origin request
  server.use(cors())


  /************* Routes ***************/

  // Get All customers data from  MongoDB
  router.get('/api/customers', customerController.getCustomers);

  //Middleware 
  router.get("*", verifyRequest(), async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;

  })

  //Routes setup
  server.use(router.allowedMethods());
  server.use(router.routes());

  /************* Routes End***************/

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

});



