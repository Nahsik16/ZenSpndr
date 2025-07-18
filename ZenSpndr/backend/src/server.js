import express from 'express';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';
import transactionsRoutes from "./routes/transactionsRoute.js"


dotenv.config();
const app = express();
//middleware
app.use(rateLimiter)
app.use(express.json());

// app.use ((req,res,next)=>{
//   console.log("hey we hit a req ,the method is ",req.method);
//   next();
// });


const PORT = process.env.PORT || 3000;


app.use("/api/transactions",transactionsRoutes)
//app.use("/api/products", filename imported)    
// this way easier to create api


initDB().then(()=>{
  app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
})

