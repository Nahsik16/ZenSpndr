import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoutes from "./routes/transactionsRoute.js"


dotenv.config();
const app = express();

//middleware
app.use(cors({
  origin: ['exp://localhost:8081', 'http://localhost:8081', 'exp://192.168.0.103:8081', 'http://localhost:19006', 'exp://192.168.0.103:19006'],
  credentials: true
}));
// app.use(rateLimiter); // Temporarily disabled due to network issues
app.use(express.json());

// app.use ((req,res,next)=>{
//   console.log("hey we hit a req ,the method is ",req.method);
//   next();
// });


const PORT = process.env.PORT || 3000;

// Test endpoint for connectivity
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use("/api/transactions",transactionsRoutes)
//app.use("/api/products", filename imported)    
// this way easier to create api


initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Access from mobile device: http://192.168.0.103:${PORT}`);
  });
});

