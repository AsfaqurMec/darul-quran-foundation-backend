import express from 'express';
import 'express-async-errors'; // Must be imported before routes to catch async errors
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import expressMongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { corsMiddleware } from './modules/common/middleware/cors.middleware';
import { errorMiddleware } from './modules/common/middleware/error.middleware';
import { logger } from './modules/common/utils/logger';
import routes from './routes';
import { config } from './config';
// const SSLCommerzPayment = require("sslcommerz-lts");
// import { ObjectId } from 'mongoose';
const app = express();

// Trust proxy - Required when behind reverse proxy (nginx, load balancer, etc.)
// This allows express-rate-limit to correctly identify client IPs from X-Forwarded-For header
app.set('trust proxy', false);

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(corsMiddleware); // Dynamic CORS configuration
app.use(expressMongoSanitize()); // Prevents NoSQL injection attacks

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Rate limiting
// Note: In production, use Redis store for distributed rate limiting
const limiter = rateLimit({
  windowMs: 150 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

//payment codes - Note: This appears to be duplicate/unused code. Consider removing if not needed.

// const store_id = process.env.SSLCOMMERZ_STORE_ID;
// const store_password = process.env.SSLCOMMERZ_STORE_PASSWORD;
// const is_live = process.env.SSLCOMMERZ_IS_LIVE;

//  app.post("/payment", async (req, res) => {
//   const tran_id = new ObjectID().toString();
//   const payload = req.body;
//     const data = {
//       total_amount: payload.amount,
//       tran_id: tran_id,
//       success_url: `http://localhost:5000/api/v1/payment/success/${tran_id}`,
//       fail_url: `http://localhost:5000/api/v1/payment/fail/${tran_id}`,
//       cancel_url: `http://localhost:5000/api/v1/payment/cancel/${tran_id}`
//     };

//     const sslcz = new SSLCommerzPayment(config.sslcommerz.storeId, config.sslcommerz.storePassword, config.sslcommerz.isLive);
//     sslcz.init(data).then((apiResponse: any) => {
//         let GatewayPageURL = apiResponse.GatewayPageURL;
//         res.send({ url: GatewayPageURL });
//     });

//    app.post("/payment/success/:tranId", async (req, res) => {
//        //db te save hobe with status payed
//       //  if( create){
//       //   res.redirect(`frontend success url`)
//       //  }
//    })

//    app.post("/payment/fail/:tranId", async (req, res) => {
//     //db te save hobe with status payed
//    //  if( create){
//    //   res.redirect(`frontend success url`)
//    //  }
// })

// app.post("/payment/cancel/:tranId", async (req, res) => {
//   //db te save hobe with status payed
//  //  if( create){
//  //   res.redirect(`frontend success url`)
//  //  }
// })

//  })

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;

